"use client";

import { useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import ChatPanel from "@/components/ChatPanel";
import SearchPanel from "@/components/SearchPanel";

type Tab = "chat" | "search";

export default function Home() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="flex justify-center h-screen bg-gray-50">
      <div className="flex flex-col w-full h-full" style={{ maxWidth: "680px" }}>

        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 shrink-0">
          <h1 className="text-base font-semibold text-gray-900">Shopping List Chat</h1>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </header>

        {/* Tabs */}
        <div className="flex px-5 bg-white border-b border-gray-100 shrink-0">
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
          {tab === "chat" ? <ChatPanel /> : <SearchPanel />}
        </div>

      </div>
    </div>
  );
}
