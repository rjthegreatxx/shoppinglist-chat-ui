"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import ChatBubble from "./ChatBubble";
import { fetchHistory, streamChat } from "@/lib/api";
import type { RagSource } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: RagSource[];
}

function getSessionId(): string {
  const key = "chat_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = "session-" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(key, id);
  }
  return id;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);
    fetchHistory(id).then((history) => {
      setMessages(history.map((m) => ({ role: m.role, content: m.content })));
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function newChat() {
    const id = "session-" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("chat_session_id", id);
    setSessionId(id);
    setMessages([]);
    textareaRef.current?.focus();
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    setInput("");
    setStreaming(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);

    try {
      let sources: RagSource[] | undefined;
      for await (const chunk of streamChat(sessionId, text)) {
        if (chunk.sources) {
          sources = chunk.sources;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              sources,
            };
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function onInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Session bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{sessionId}</span>
        <button
          onClick={newChat}
          className="text-xs text-gray-400 border border-gray-200 rounded-md px-2.5 py-1 hover:bg-gray-100 transition-colors"
        >
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2">
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
      <div className="flex gap-2 pt-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onInput={onInput}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[0.95rem] resize-none outline-none bg-white max-h-36 leading-snug focus:border-[#0a84ff] transition-colors"
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="px-5 py-2.5 bg-[#0a84ff] text-white rounded-xl text-[0.95rem] font-medium self-end hover:bg-[#006edc] disabled:bg-gray-300 disabled:cursor-default transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
