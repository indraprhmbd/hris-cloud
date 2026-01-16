"use client";

import { useState, useRef, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
}

export default function PolicyChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya Asisten Kebijakan Karyawan. Ada yang bisa saya bantu terkait kebijakan perusahaan hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const res = await fetch(
        `${API_URL}/policy/chat?query=${encodeURIComponent(userMessage)}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to get answer");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          reasoning: data.reasoning,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Maaf, saya sedang mengalami gangguan teknis. Silakan coba lagi nanti.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full bg-white border-x border-gray-100">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h1 className="text-lg font-semibold text-gray-900">
          Employee Policy Assistant
        </h1>
        <p className="text-xs text-gray-500">
          Ask anything about company rules, leaves, or benefits.
        </p>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 selection:bg-gray-100"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className={`max-w-[85%] space-y-2`}>
              <div
                className={`p-3 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-black text-white rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                }`}
              >
                {m.content}
              </div>
              {m.reasoning && (
                <div className="px-3 py-1 bg-blue-50/50 border-l-2 border-blue-200 text-[10px] text-blue-600 font-mono italic">
                  AI Reasoning: {m.reasoning}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none border border-gray-200 flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your question (e.g., How many annual leave days do I have?)"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-black text-white p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          AI answers are based on company documents. Always verify with HR for
          critical matters.
        </p>
      </div>
    </div>
  );
}
