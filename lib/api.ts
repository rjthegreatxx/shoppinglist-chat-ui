import type { Message, ProductResult, RagSource } from "./types";

const BASE = "/api";

export async function fetchHistory(sessionId: string): Promise<Message[]> {
  const res = await fetch(`${BASE}/history/${sessionId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function searchProducts(
  query: string,
  topK = 10
): Promise<ProductResult[]> {
  const res = await fetch(`${BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK }),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

const SOURCES_PREFIX = "__SOURCES__:";

export async function* streamChat(
  sessionId: string,
  message: string
): AsyncGenerator<{ text?: string; sources?: RagSource[] }> {
  const res = await fetch(`${BASE}/chat/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sourcesEmitted = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    if (!sourcesEmitted) {
      const nl = buffer.indexOf("\n");
      if (nl !== -1) {
        const firstLine = buffer.slice(0, nl);
        if (firstLine.startsWith(SOURCES_PREFIX)) {
          try {
            const meta = JSON.parse(firstLine.slice(SOURCES_PREFIX.length));
            if (meta.sources?.length) yield { sources: meta.sources };
          } catch {}
          buffer = buffer.slice(nl + 1);
        }
        sourcesEmitted = true;
      }
    }

    if (sourcesEmitted || !buffer.includes("\n")) {
      yield { text: buffer };
      buffer = "";
    }
  }

  if (buffer) yield { text: buffer };
}
