"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/lib/api";
import type { CartItem } from "@/lib/types";

interface Props {
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CartDrawer({ items, onClose, onUpdateQty, onRemove }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);

  async function checkout() {
    setLoading(true);
    setError("");
    try {
      const url = await createCheckoutSession(items);
      window.location.href = url;
    } catch {
      setError("Checkout failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Your cart is empty.
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.product_id} className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800 leading-snug">{item.name}</p>
                  <button
                    onClick={() => onRemove(item.product_id)}
                    className="text-gray-300 hover:text-red-400 text-base leading-none shrink-0 mt-0.5"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQty(item.product_id, -1)}
                      className="w-6 h-6 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item.product_id, 1)}
                      className="w-6 h-6 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">{fmt(item.price_cents * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex justify-between text-sm font-semibold text-gray-900">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={checkout}
            disabled={items.length === 0 || loading}
            className="w-full py-3 bg-blue-500 text-white rounded-2xl text-sm font-medium hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-default transition-colors"
          >
            {loading ? "Redirecting…" : "Checkout"}
          </button>
        </div>
      </div>
    </>
  );
}
