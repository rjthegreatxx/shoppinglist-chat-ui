"use client";

import { useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import ChatPanel from "@/components/ChatPanel";
import SearchPanel from "@/components/SearchPanel";

type Tab = "chat" | "search";

export default function Home() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="flex flex-col items-center h-full px-4 pb-4">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4">
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Shopping List Chat</h1>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

      {/* Tabs */}
      <div className="w-full max-w-4xl flex gap-1 border-b-2 border-gray-200 mb-4">
        {(["chat", "search"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-[2px] transition-colors ${
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
      <div className="w-full max-w-4xl flex flex-col flex-1 min-h-0">
        {tab === "chat" ? <ChatPanel /> : <SearchPanel />}
      </div>
    </div>
  );
}
