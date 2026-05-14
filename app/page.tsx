"use client";

import { useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import ChatPanel from "@/components/ChatPanel";
import SearchPanel from "@/components/SearchPanel";

type Tab = "chat" | "search";

export default function Home() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="flex flex-col items-center h-full px-4 py-4">
      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between py-3">
        <h1 className="text-[1.1rem] font-semibold text-[#1a1a1a]">Shopping List Chat</h1>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

      {/* Tabs */}
      <div className="w-full max-w-3xl flex gap-1 border-b-2 border-gray-200 mb-3">
        {(["chat", "search"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[0.9rem] capitalize border-b-2 -mb-[2px] transition-colors ${
              tab === t
                ? "text-[#0a84ff] border-[#0a84ff] font-medium"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            {t === "chat" ? "Chat" : "Product Search"}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="w-full max-w-3xl flex flex-col flex-1 min-h-0">
        {tab === "chat" ? <ChatPanel /> : <SearchPanel />}
      </div>
    </div>
  );
}
