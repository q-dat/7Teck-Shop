import { issueSignedToken } from '@vercel/blob';
import { handleUploadPresigned, type HandleUploadPresignedBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

type ClientPayload = {
  uploadKey: string;
};

const BLOB_BACKUP_PATHNAME = 'local-products/backups/local-products-current.json.gz';

const allowedContentTypes = ['application/gzip', 'application/x-gzip', 'application/octet-stream'];

const maximumSizeInBytes = 200 * 1024 * 1024;

const parseClientPayload = (value: string | null | undefined): ClientPayload | null => {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);

    if (typeof parsed !== 'object' || parsed === null) return null;

    const record = parsed as Record<string, unknown>;

    if (typeof record.uploadKey !== 'string') return null;

    return {
      uploadKey: record.uploadKey,
    };
  } catch {
    return null;
  }
};

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadPresignedBody;

  try {
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname, clientPayload) => {
        const payload = parseClientPayload(clientPayload);
        const uploadKey = process.env.BLOB_BACKUP_UPLOAD_KEY;

        if (!uploadKey || payload?.uploadKey !== uploadKey) {
          throw new Error('Mật khẩu upload không đúng');
        }

        if (pathname !== BLOB_BACKUP_PATHNAME) {
          throw new Error('Đường dẫn upload không hợp lệ');
        }

        return {
          token: await issueSignedToken({
            pathname: BLOB_BACKUP_PATHNAME,
            operations: ['put'],
            allowedContentTypes,
            maximumSizeInBytes,
            validUntil: Date.now() + 60 * 60 * 1000,
          }),
          urlOptions: {
            allowedContentTypes,
            maximumSizeInBytes,
            validUntil: Date.now() + 10 * 60 * 1000,
            addRandomSuffix: false,
            allowOverwrite: true,
            cacheControlMaxAge: 60,
          },
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Local products backup replaced:', {
          pathname: blob.pathname,
          url: blob.url,
        });
      },
    });

    return NextResponse.json(jsonResponse);
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
