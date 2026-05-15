"use client";

import { useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import CartDrawer from "@/components/CartDrawer";
import ChatPanel from "@/components/ChatPanel";
import SearchPanel from "@/components/SearchPanel";
import type { CartItem, ProductResult } from "@/lib/types";

type Tab = "chat" | "search";

export default function Home() {
  const [tab, setTab] = useState<Tab>("chat");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  function addToCart(product: ProductResult, priceCents: number) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.product_id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product_id: product.product_id, name: product.name, price_cents: priceCents, quantity: 1 }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.product_id === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex justify-center h-screen bg-gray-50">
      <div className="flex flex-col w-full h-full" style={{ maxWidth: "680px" }}>

        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 shrink-0">
          <h1 className="text-base font-semibold text-gray-900">Shopping List Chat</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Open cart"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 px-5 bg-white border-b border-gray-100 shrink-0">
          {(["chat", "search"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "text-blue-500 border-blue-500"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              {t === "chat" ? "Chat" : "Product Search"}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="flex flex-col flex-1 min-h-0">
          {tab === "chat" ? <ChatPanel /> : <SearchPanel onAddToCart={addToCart} />}
        </div>

      </div>

      {cartOpen && (
        <CartDrawer
          items={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
        />
      )}
    </div>
  );
}
