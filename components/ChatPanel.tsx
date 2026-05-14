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
    fetchHistory(sessionId).then((history) => {
      setMessages(history.map((m) => ({ role: m.role, content: m.content })));
    });
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
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], sources: chunk.sources };
            return updated;
          });
        }
        if (chunk.text) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + chunk.text,
            };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Connection error. Please try again.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function onInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4 px-1">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">Ask me about products in the catalog.</p>
          </div>
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
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onInput={onInput}
          placeholder="Type a message…"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm resize-none outline-none bg-white leading-snug focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="px-5 py-3 bg-blue-500 text-white rounded-2xl text-sm font-medium self-end hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-default transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
