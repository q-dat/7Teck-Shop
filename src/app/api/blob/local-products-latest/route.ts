import { issueSignedToken, list, presignUrl } from '@vercel/blob';
import { NextResponse } from 'next/server';

const BLOB_BACKUP_PATHNAME = 'local-products/backups/local-products-current.json.gz';

export async function GET(): Promise<NextResponse> {
  try {
    const { blobs } = await list({
      prefix: 'local-products/backups/',
      limit: 1000,
    });

    const currentBlob = blobs.find((blob) => blob.pathname === BLOB_BACKUP_PATHNAME);

    if (!currentBlob) {
      return NextResponse.json(
        {
          message: 'Chưa có file backup online hiện tại',
        },
        {
          status: 404,
        }
      );
    }

    const token = await issueSignedToken({
      pathname: BLOB_BACKUP_PATHNAME,
      operations: ['get'],
      validUntil: Date.now() + 60 * 60 * 1000,
    });

    const { presignedUrl } = await presignUrl(token, {
      operation: 'get',
      pathname: BLOB_BACKUP_PATHNAME,
      access: 'private',
      validUntil: Date.now() + 10 * 60 * 1000,
    });

    return NextResponse.json({
      pathname: currentBlob.pathname,
      downloadUrl: presignedUrl,
      size: currentBlob.size,
      uploadedAt: currentBlob.uploadedAt,
      etag: currentBlob.etag,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Không thể lấy backup online hiện tại',
      },
      {
        status: 400,
      }
    );
  }
}
