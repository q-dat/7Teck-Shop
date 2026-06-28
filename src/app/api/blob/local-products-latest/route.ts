import { issueSignedToken, list, presignUrl } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const { blobs } = await list({
      prefix: "local-products/backups/",
      limit: 1000,
    });

    const latestBlob = blobs
      .filter((blob) => blob.pathname.endsWith(".json.gz"))
      .sort(
        (firstBlob, secondBlob) =>
          new Date(secondBlob.uploadedAt).getTime() -
          new Date(firstBlob.uploadedAt).getTime(),
      )[0];

    if (!latestBlob) {
      return NextResponse.json(
        {
          message: "Chưa có bản backup online",
        },
        {
          status: 404,
        },
      );
    }

    const token = await issueSignedToken({
      pathname: latestBlob.pathname,
      operations: ["get"],
      validUntil: Date.now() + 10 * 60 * 1000,
    });

    const { presignedUrl } = await presignUrl(token, {
      operation: "get",
      pathname: latestBlob.pathname,
      access: "private",
      validUntil: Date.now() + 10 * 60 * 1000,
    });

    return NextResponse.json({
      pathname: latestBlob.pathname,
      downloadUrl: presignedUrl,
      size: latestBlob.size,
      uploadedAt: latestBlob.uploadedAt,
      etag: latestBlob.etag,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy backup mới nhất",
      },
      {
        status: 400,
      },
    );
  }
}