const API = process.env.API_URL ?? "http://localhost:8000";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const upstream = await fetch(`${API}/history/${sessionId}`);
  const data = await upstream.json();
  return Response.json(data);
}
