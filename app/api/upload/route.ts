import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "file missing" }, { status: 400 });
    if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const { bunnyUploadFromBuffer } = await import("@/lib/storage");
    const { publicUrl } = await bunnyUploadFromBuffer(buf, file.name);
    return NextResponse.json({ publicUrl });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "upload failed" }, { status: 500 });
  }
}
