import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

type ClientPayload = {
  uploadKey: string;
};

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
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parseClientPayload(clientPayload);
        const uploadKey = process.env.BLOB_BACKUP_UPLOAD_KEY;

        if (!uploadKey || payload?.uploadKey !== uploadKey) {
          throw new Error('Không có quyền upload backup');
        }

        if (!pathname.startsWith('local-products/backups/')) {
          throw new Error('Đường dẫn upload không hợp lệ');
        }

        if (!pathname.endsWith('.json.gz')) {
          throw new Error('Chỉ cho phép upload file .json.gz');
        }

        return {
          allowedContentTypes: ['application/gzip', 'application/x-gzip', 'application/octet-stream'],
          addRandomSuffix: false,
          allowOverwrite: false,
          cacheControlMaxAge: 60,
          tokenPayload: JSON.stringify({
            type: 'local-products-backup',
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Local products backup uploaded:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Không thể upload backup',
      },
      {
        status: 400,
      }
    );
  }
}
