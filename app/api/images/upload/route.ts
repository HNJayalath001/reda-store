import { NextRequest, NextResponse } from "next/server";
import { getBucket } from "@/lib/db/gridfs";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });
    if (files.length > 5) return NextResponse.json({ error: "Maximum 5 files allowed" }, { status: 400 });

    const bucket = await getBucket();
    const uploadedIds: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: { contentType: file.type, uploadedBy: result.admin.adminId },
      });
      await new Promise<void>((resolve, reject) => {
        const readable = Readable.from(buffer);
        readable.pipe(uploadStream);
        uploadStream.on("finish", resolve);
        uploadStream.on("error", reject);
      });
      uploadedIds.push(uploadStream.id.toString());
    }

    return NextResponse.json({ fileIds: uploadedIds });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
