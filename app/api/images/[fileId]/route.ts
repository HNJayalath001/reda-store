import { NextRequest, NextResponse } from "next/server";
import { getBucket } from "@/lib/db/gridfs";
import { toObjectId } from "@/lib/db/toObjectId";

export async function GET(_: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    const oid = toObjectId(fileId);
    if (!oid) return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });

    const bucket = await getBucket();

    // Get file metadata
    const files = await bucket.find({ _id: oid }).toArray();
    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];
    const contentType = file.metadata?.contentType || "image/jpeg";

    const chunks: Buffer[] = [];
    const downloadStream = bucket.openDownloadStream(oid);

    await new Promise<void>((resolve, reject) => {
      downloadStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      downloadStream.on("end", resolve);
      downloadStream.on("error", reject);
    });

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
