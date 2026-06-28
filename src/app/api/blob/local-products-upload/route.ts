import { issueSignedToken, presignUrl } from '@vercel/blob';
import { NextResponse } from 'next/server';

type UploadRequestBody = {
  pathname: string;
  uploadKey: string;
  contentType: string;
  size: number;
};

const isUploadRequestBody = (value: unknown): value is UploadRequestBody => {
  if (typeof value !== 'object' || value === null) return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.pathname === 'string' &&
    typeof record.uploadKey === 'string' &&
    typeof record.contentType === 'string' &&
    typeof record.size === 'number'
  );
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed: unknown = await request.json();

    if (!isUploadRequestBody(parsed)) {
      return NextResponse.json(
        {
          message: 'Payload upload không hợp lệ',
        },
        {
          status: 400,
        }
      );
    }

    const uploadKey = process.env.BLOB_BACKUP_UPLOAD_KEY;

    if (!uploadKey || parsed.uploadKey !== uploadKey) {
      return NextResponse.json(
        {
          message: 'Mật khẩu upload không đúng',
        },
        {
          status: 401,
        }
      );
    }

    if (!parsed.pathname.startsWith('local-products/backups/')) {
      return NextResponse.json(
        {
          message: 'Đường dẫn upload không hợp lệ',
        },
        {
          status: 400,
        }
      );
    }

    if (!parsed.pathname.endsWith('.json.gz')) {
      return NextResponse.json(
        {
          message: 'Chỉ cho phép upload file .json.gz',
        },
        {
          status: 400,
        }
      );
    }

    const allowedContentTypes = ['application/gzip', 'application/x-gzip', 'application/octet-stream'];

    if (!allowedContentTypes.includes(parsed.contentType)) {
      return NextResponse.json(
        {
          message: 'Định dạng file upload không hợp lệ',
        },
        {
          status: 400,
        }
      );
    }

    const maximumSizeInBytes = 200 * 1024 * 1024;

    if (parsed.size <= 0 || parsed.size > maximumSizeInBytes) {
      return NextResponse.json(
        {
          message: 'Dung lượng file upload không hợp lệ',
        },
        {
          status: 400,
        }
      );
    }

    const token = await issueSignedToken({
      pathname: parsed.pathname,
      operations: ['put'],
      allowedContentTypes,
      maximumSizeInBytes,
      validUntil: Date.now() + 10 * 60 * 1000,
    });

    const { presignedUrl } = await presignUrl(token, {
      operation: 'put',
      pathname: parsed.pathname,
      access: 'private',
      allowedContentTypes,
      maximumSizeInBytes,
      addRandomSuffix: false,
      allowOverwrite: false,
      cacheControlMaxAge: 60,
      validUntil: Date.now() + 10 * 60 * 1000,
    });

    return NextResponse.json({
      pathname: parsed.pathname,
      presignedUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Không thể tạo link upload Blob',
      },
      {
        status: 400,
      }
    );
  }
}
