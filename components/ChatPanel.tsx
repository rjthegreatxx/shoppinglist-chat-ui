"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useUser } from "@clerk/nextjs";
import ChatBubble from "./ChatBubble";
import { fetchHistory, streamChat } from "@/lib/api";
import type { RagSource } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: RagSource[];
}

export default function ChatPanel() {
  const { user } = useUser();
  const sessionId = user?.id ?? "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!sessionId) return;
    setMessages([]);
    fetchHistory(sessionId).then((h) =>
      setMessages(h.map((m) => ({ role: m.role, content: m.content })))
    );
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming || !sessionId) return;

    setInput("");
    setStreaming(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);

    try {
      for await (const chunk of streamChat(sessionId, text)) {
        if (chunk.sources) {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], sources: chunk.sources };
            return next;
          });
        }
        if (chunk.text) {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              ...next[next.length - 1],
              content: next[next.length - 1].content + chunk.text,
            };
            return next;
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], content: "Connection error. Please try again." };
        return next;
      });
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pt-5 pb-3 space-y-5">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">Ask me about products in the catalog.</p>
        )}
        {messages.map((m, i) => (
          <ChatBubble
            key={i}
            role={m.role}
            content={m.content}
            sources={m.sources}
            streaming={streaming && i === messages.length - 1 && m.role === "assistant"}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 flex items-end gap-3 px-5 py-4 bg-white border-t border-gray-200" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onInput={autoResize}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-2xl text-sm resize-none outline-none bg-gray-50 leading-snug focus:border-blue-400 focus:bg-white transition-all"
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="px-5 py-2.5 bg-blue-500 text-white rounded-2xl text-sm font-medium hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-default transition-colors shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  );
}
