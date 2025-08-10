export async function bunnyUploadFromBuffer(buf: Buffer, filename: string) {
  const zone = process.env.BUNNY_STORAGE_ZONE!;
  const apiKey = process.env.BUNNY_API_KEY!;
  const objectPath = `uploads/${Date.now()}-${filename}`;
  const url = `https://${zone}.storage.bunnycdn.com/${objectPath}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: { "AccessKey": apiKey, "Content-Type": "application/octet-stream" },
    body: buf,
  });
  if (!res.ok) throw new Error(`Bunny upload failed: ${res.status} ${await res.text()}`);
  const base = (process.env.BUNNY_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  return { publicUrl: `${base}/${objectPath}`, objectPath };
}
