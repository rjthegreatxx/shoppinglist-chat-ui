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
      <div
        className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-5 py-4 text-sm leading-loose"
        style={{
          justifySelf: "end",
          maxWidth: "70%",
          wordBreak: "break-word",
          marginRight: "4px",
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        justifySelf: "start",
        maxWidth: "86%",
        marginLeft: "4px",
      }}
    >
      <div
        className="bg-white rounded-2xl rounded-tl-sm px-5 py-5 text-sm leading-loose text-gray-800 border border-gray-200 shadow-sm"
        style={{ wordBreak: "break-word" }}
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
        <div className="flex flex-wrap items-center gap-1.5 mt-2 pl-1">
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
