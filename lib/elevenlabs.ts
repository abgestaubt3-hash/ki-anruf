export async function ensureElevenLabsVoice(orderId: string, audioUrl: string): Promise<string> {
  const r = await fetch(audioUrl);
  if (!r.ok) throw new Error("Audio fetch failed for ElevenLabs");
  const buf = Buffer.from(await r.arrayBuffer());

  const form = new FormData();
  form.append("name", `order_${orderId}`);
  const guessedType =
    audioUrl.endsWith(".wav") ? "audio/wav" :
    audioUrl.endsWith(".m4a") ? "audio/mp4" :
    audioUrl.endsWith(".mp3") ? "audio/mpeg" : "application/octet-stream";
  form.append("files", new Blob([buf], { type: guessedType }), `order_${orderId}`);

  const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
    body: form,
  });
  if (!res.ok) throw new Error("ElevenLabs voice creation failed: " + await res.text());
  const data = await res.json();
  return data.voice_id as string;
}
