const MODEL = "qwen/qwen3.8-27b"; // if this errors, check console.groq.com/docs/models for a current model

export async function geminiJSON<T>(
  prompt: string,
  _image?: { mimeType: string; data: string } // photo input is not supported by this fallback
): Promise<T> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You return only valid JSON, nothing else." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM_${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as T;
}