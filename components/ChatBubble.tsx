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
      <div className="self-end max-w-[75%]">
        <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-blue-500 text-white text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="self-start max-w-[75%] flex flex-col gap-1.5">
      <div
        ref={ref}
        className={`px-4 py-3 rounded-2xl rounded-bl-sm bg-white text-gray-800 text-sm leading-relaxed break-words shadow-sm border border-gray-100 prose prose-sm max-w-none ${
          streaming ? "after:content-['▋'] after:animate-pulse after:ml-0.5 after:text-gray-400" : ""
        }`}
      >
        {streaming ? content : null}
      </div>
      {sources && sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          <span className="text-xs text-gray-400 font-medium self-center">Sources:</span>
          {sources.map((s) => (
            <span
              key={s.id}
              title={s.id}
              className="text-[0.7rem] bg-blue-50 text-blue-500 border border-blue-100 rounded-full px-2.5 py-0.5 font-medium"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
