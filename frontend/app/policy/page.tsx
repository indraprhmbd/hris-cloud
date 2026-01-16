"use client";

import { useState, useRef, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
}

export default function EmployeePolicyPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya HARIS, asisten kebijakan Anda. Silakan pilih ID karyawan untuk simulasi data cuti, lalu tanyakan sesuatu.",
    },
  ]);
  const [input, setInput] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Fetch generic list of employees for DEMO Selection
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchEmployees() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    // Using a public endpoint trick or assuming open RLS for hackathon demo
    // In real prod, this would be a proper login flow.
    // For now, I'll fetch via the backend proxy if possible, or just mock it if auth is strict.
    // Let's assume we use the user's token if they happen to be logged in as HR,
    // BUT for a "Separate Frontend" usually this is public.
    // To make it work for demo, I will just input ID manually or let it be empty (Generic Context).
    // Better: I will let the user type an ID, or I'll implement a simple public list endpoint if needed.
    // Let's skip auto-fetch for now to avoid Auth complexity on this public page.
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // In this public page, we might not have a session.
      // We need to use an anonymous key or a specific demo user token.
      // For hackathon MVP, let's assume we use a 'public' token or just no token if backend allows.
      // However, backend requires 'get_current_user'.
      // I will use the anon key and hope the backend logic handles it, OR I will temporary use a hardcoded token for DEMO.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      let url = `${API_URL}/policy/chat?query=${encodeURIComponent(
        userMessage
      )}`;
      if (employeeId) {
        url += `&employee_id=${employeeId}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`, // Attempt to use session if exists
        },
      });

      if (!res.ok) {
        if (res.status === 401)
          throw new Error(
            "Please login to Dashboard first (Auth required for API)"
          );
        throw new Error("Failed to get answer");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          reasoning: data.reasoning,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message}. (Note: Backend auth is active, ensure you are logged in or disabled auth for demo)`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
          <span className="font-bold text-xl tracking-tight">HARIS Policy</span>
        </div>
        <div className="text-sm text-gray-500">Employee Portal</div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col">
        {/* Context Selector (Demo Only) */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-blue-900 mb-2">
            Simulate Employee Context (Demo)
          </h3>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-blue-200 rounded px-3 py-2 text-sm"
              placeholder="Enter Employee UUID from Dashboard..."
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-blue-600 mt-2">
            *Entering an ID allows HARIS to check your specific leave balance
            (Read-Only).
          </p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`max-w-[80%] space-y-2`}>
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.reasoning && (
                    <div className="bg-yellow-50 border-l-2 border-yellow-400 p-2 text-[11px] text-yellow-800 rounded-r">
                      <strong>AI Checking Logic:</strong> {m.reasoning}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 text-gray-400 text-sm animate-pulse">
                  Checking policies & data...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-sm"
                placeholder="Ask about leave, benefits, or rules..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
