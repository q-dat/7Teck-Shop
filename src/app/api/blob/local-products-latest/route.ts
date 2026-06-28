import { issueSignedToken, presignUrl } from '@vercel/blob';
import { NextResponse } from 'next/server';

const BLOB_BACKUP_PATHNAME = 'local-products/backups/local-products-current.json.gz';

export async function GET(): Promise<NextResponse> {
  try {
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
      pathname: BLOB_BACKUP_PATHNAME,
      downloadUrl: presignedUrl,
      size: 0,
      uploadedAt: new Date().toISOString(),
      etag: '',
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Không thể lấy backup hiện tại',
      },
      {
        status: 400,
      }
    );
  }
}
