export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface RagSource {
  id: string;
  name: string;
}

export interface ProductResult {
  product_id: string;
  name: string;
  description: string;
  score: number;
}
