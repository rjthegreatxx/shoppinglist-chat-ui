"use client";

import { KeyboardEvent, useState } from "react";
import { searchProducts } from "@/lib/api";
import type { ProductResult } from "@/lib/types";

function mockPriceCents(productId: string): number {
  const num = parseInt(productId.split("-")[1] ?? "1", 10) || 1;
  return (num % 10 + 1) * 499;
}

interface Props {
  onAddToCart: (product: ProductResult, priceCents: number) => void;
}

export default function SearchPanel({ onAddToCart }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function doSearch() {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const data = await searchProducts(q);
      setResults(data);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") doSearch();
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search products (e.g. wound dressing, IV catheter)…"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[0.95rem] outline-none bg-white focus:border-[#0a84ff] transition-colors"
        />
        <button
          onClick={doSearch}
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 bg-[#0a84ff] text-white rounded-xl text-[0.95rem] font-medium whitespace-nowrap hover:bg-[#006edc] disabled:bg-gray-300 disabled:cursor-default transition-colors"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5">
        {error && <p className="text-center text-sm text-red-500 mt-8">{error}</p>}

        {results === null && !error && (
          <p className="text-center text-sm text-gray-400 mt-8">
            Enter a search term to find products.
          </p>
        )}

        {results?.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">
            No products found for &ldquo;{query}&rdquo;.
          </p>
        )}

        {results?.map((p) => {
          const priceCents = mockPriceCents(p.product_id);
          return (
            <div key={p.product_id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[0.95rem] text-[#1a1a1a]">{p.name}</p>
                  <p className="text-xs text-gray-400 mb-1.5">ID: {p.product_id}</p>
                  <p className="text-[0.88rem] text-[#444] leading-relaxed">{p.description}</p>
                  <p className="text-[0.72rem] text-[#0a84ff] font-medium mt-2">
                    Relevance: {(p.score * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-sm font-semibold text-gray-800">
                    ${(priceCents / 100).toFixed(2)}
                  </p>
                  <button
                    onClick={() => onAddToCart(p, priceCents)}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors whitespace-nowrap"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
