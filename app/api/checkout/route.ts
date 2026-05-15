const API = process.env.API_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  const { items } = await req.json();
  const upstream = await fetch(`${API}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map(({ product_id, name, quantity }: { product_id: string; name: string; quantity: number }) => ({
        product_id,
        name,
        quantity,
      })),
    }),
  });
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
