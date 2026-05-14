const API = process.env.API_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  const body = await req.json();
  const upstream = await fetch(`${API}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
