"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function PolicyManagementPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchLogs();
    fetchFiles();
  }, []);

  async function fetchLogs() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${API_URL}/admin/policy/logs`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.ok) setLogs(await res.json());
  }

  async function fetchFiles() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${API_URL}/admin/policy/files`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.ok) setFiles(await res.json());
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_URL}/admin/policy/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });
      if (res.ok) {
        alert("Policy uploaded successfully!");
        fetchFiles();
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Col: Document Management */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policy Knowledge</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage documents & audit logs.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Active Documents
          </h2>
          <div className="space-y-3 mb-6">
            {files.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No policies uploaded.
              </p>
            ) : (
              files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                >
                  <span className="truncate max-w-[180px] font-medium text-gray-700">
                    {f}
                  </span>
                  <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded">
                    Indexed
                  </span>
                </div>
              ))
            )}
          </div>

          <label
            className={`block w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all ${
              uploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleUpload}
            />
            <span className="text-sm font-bold text-gray-600 block">
              {uploading ? "Uploading..." : "Upload New PDF"}
            </span>
            <span className="text-xs text-gray-400 block mt-1">
              Non-classified documents only.
            </span>
          </label>
        </div>
      </div>

      {/* Right Col: Logs */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Employee Q&A Audit Log</h2>
            <button
              onClick={fetchLogs}
              className="text-xs text-gray-500 hover:text-black"
            >
              Refresh
            </button>
          </div>
          <div className="flex-1 overflow-auto max-h-[600px]">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-white border-b border-gray-100 sticky top-0">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Question</th>
                  <th className="px-6 py-3">AI Response & Logic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No interactions recorded.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors align-top"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 break-words max-w-xs">
                        "{log.query}"
                      </td>
                      <td className="px-6 py-4 space-y-2">
                        <p className="text-gray-700">{log.answer}</p>
                        <div className="bg-blue-50 border-l-2 border-blue-200 p-2 text-xs text-blue-700 font-mono">
                          Logic: {log.reasoning}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
