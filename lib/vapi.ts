type StartCallInput = {
  to: string;
  minutes: number;
  voiceId: string;
  systemPrompt?: string;
  vars?: Record<string,string>;
};

export async function startOutboundCall(input: StartCallInput) {
  const body: any = {
    assistantId: process.env.VAPI_ASSISTANT_ID!,
    phoneNumber: input.to,
    tts: { provider: "elevenlabs", voiceId: input.voiceId },
    maxDurationSeconds: input.minutes * 60,
    bargeIn: true,
    voicemailDetection: { enabled: true, behavior: "hangup" },
    metadata: { pkgMinutes: input.minutes, ...input.vars }
  };

  if (input.systemPrompt) {
    body.llm = {
      provider: "openai",
      model: "gpt-4o",
      temperature: 0.5,
      maxOutputTokens: 250,
      systemPrompt: input.systemPrompt
    };
  }

  const res = await fetch("https://api.vapi.ai/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Vapi call failed: " + await res.text());
  return await res.json();
}
