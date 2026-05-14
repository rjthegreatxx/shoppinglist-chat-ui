"use client";

import { useEffect, useRef } from "react";
import type { RagSource } from "@/lib/types";

interface Props {
  role: "user" | "assistant";
  content: string;
  sources?: RagSource[];
  streaming?: boolean;
}

export default function ChatBubble({ role, content, sources, streaming }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && role === "assistant" && !streaming && content) {
      import("marked").then(({ marked }) =>
        import("dompurify").then(({ default: DOMPurify }) => {
          ref.current!.innerHTML = DOMPurify.sanitize(marked.parse(content) as string);
        })
      );
    }
  }, [content, role, streaming]);

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed break-words"
          style={{ maxWidth: "65%", wordBreak: "break-word" }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div
        className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-gray-800 border border-gray-200 shadow-sm break-words"
        style={{ maxWidth: "80%", wordBreak: "break-word" }}
      >
        <div ref={ref} className="prose prose-sm max-w-none">
          {streaming && (
            <>
              {content}
              <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-middle" />
            </>
          )}
        </div>
      </div>
      {sources && sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pl-1">
          <span className="text-xs text-gray-400">Sources:</span>
          {sources.map((s) => (
            <span key={s.id} title={s.id} className="text-xs bg-blue-50 text-blue-500 border border-blue-100 rounded-full px-2.5 py-0.5 font-medium">
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
