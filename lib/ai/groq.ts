export async function transcribe(file: Blob, filename = "audio.webm"): Promise<string> {
  const form = new FormData();
  form.append("file", file, filename);
  form.append("model", "whisper-large-v3");
  form.append("language", "ur");
  form.append("response_format", "json");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
  });
  if (!res.ok) throw new Error(`GROQ_${res.status}`);
  const data = await res.json();
  return (data.text ?? "").trim();
}