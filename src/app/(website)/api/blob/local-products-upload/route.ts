import { issueSignedToken, presignUrl } from "@vercel/blob";
import { NextResponse } from "next/server";

type UploadRequestBody = {
  uploadKey: string;
  contentType: string;
  size: number;
};

const BLOB_BACKUP_PATHNAME = "local-products/backups/local-products-current.json.gz";

const allowedContentTypes = [
  "application/gzip",
  "application/x-gzip",
  "application/octet-stream",
];

const maximumSizeInBytes = 200 * 1024 * 1024;

const isUploadRequestBody = (value: unknown): value is UploadRequestBody => {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.uploadKey === "string" &&
    typeof record.contentType === "string" &&
    typeof record.size === "number" &&
    Number.isFinite(record.size)
  );
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed: unknown = await request.json();

    if (!isUploadRequestBody(parsed)) {
      return NextResponse.json(
        {
          message: "Payload upload không hợp lệ",
        },
        {
          status: 400,
        },
      );
    }

    const uploadKey = process.env.BLOB_BACKUP_UPLOAD_KEY;

    if (!uploadKey || parsed.uploadKey.trim() !== uploadKey) {
      return NextResponse.json(
        {
          message: "Mật khẩu upload không đúng",
        },
        {
          status: 401,
        },
      );
    }

    if (!allowedContentTypes.includes(parsed.contentType)) {
      return NextResponse.json(
        {
          message: "Định dạng file upload không hợp lệ",
        },
        {
          status: 400,
        },
      );
    }

    if (parsed.size <= 0 || parsed.size > maximumSizeInBytes) {
      return NextResponse.json(
        {
          message: "Dung lượng file upload không hợp lệ",
        },
        {
          status: 400,
        },
      );
    }

    const token = await issueSignedToken({
      pathname: BLOB_BACKUP_PATHNAME,
      operations: ["put"],
      allowedContentTypes,
      maximumSizeInBytes,
      validUntil: Date.now() + 60 * 60 * 1000,
    });

    const { presignedUrl } = await presignUrl(token, {
      operation: "put",
      pathname: BLOB_BACKUP_PATHNAME,
      access: "private",
      allowedContentTypes,
      maximumSizeInBytes,
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      validUntil: Date.now() + 10 * 60 * 1000,
    });

    return NextResponse.json({
      pathname: BLOB_BACKUP_PATHNAME,
      presignedUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tạo link upload Blob",
      },
      {
        status: 400,
      },
    );
  }
}
