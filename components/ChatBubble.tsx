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
    if (ref.current && role === "assistant" && !streaming) {
      import("marked").then(({ marked }) =>
        import("dompurify").then(({ default: DOMPurify }) => {
          ref.current!.innerHTML = DOMPurify.sanitize(marked.parse(content) as string);
        })
      );
    }
  }, [content, role, streaming]);

  if (role === "user") {
    return (
      <div className="self-end max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-[#0a84ff] text-white text-[0.95rem] leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </div>
    );
  }

  return (
    <>
      <div
        ref={ref}
        className={`self-start max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white text-[#1a1a1a] text-[0.95rem] leading-relaxed shadow-sm break-words prose prose-sm max-w-none ${
          streaming ? "after:content-['▋'] after:animate-pulse after:ml-0.5" : ""
        }`}
      >
        {streaming ? content : null}
      </div>
      {sources && sources.length > 0 && (
        <div className="self-start flex flex-wrap gap-1.5 max-w-[80%] pt-0.5">
          <span className="text-xs text-gray-400 font-medium self-center">Sources:</span>
          {sources.map((s) => (
            <span
              key={s.id}
              title={s.id}
              className="text-[0.7rem] bg-blue-50 text-[#0a84ff] rounded px-2 py-0.5"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
