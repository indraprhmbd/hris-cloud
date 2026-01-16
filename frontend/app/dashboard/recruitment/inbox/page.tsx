"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getOrgApplicants, updateApplicantStatus } from "@/lib/api";

interface Applicant {
  id: string;
  name: string;
  email: string;
  project_id: string;
  project_name?: string;
  ai_score: number;
  ai_reasoning?: string;
  status: string;
  cv_text: string;
  created_at: string;
}

export default function CVInboxPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blindMode, setBlindMode] = useState(false);

  const { data: allCandidates = [], mutate } = useSWR<Applicant[]>(
    "applicants-inbox",
    getOrgApplicants,
    { refreshInterval: 10000 }
  );

  // Filter for screening stage (processing or interview_pending)
  const candidates = allCandidates.filter(
    (c) => c.status === "processing" || c.status === "interview_pending"
  );

  const selectedCandidate = candidates.find((c) => c.id === selectedId);

  async function handleMoveToInterview(id: string) {
    try {
      await updateApplicantStatus(id, "interview_pending");
      mutate();
      setSelectedId(null);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Reject this candidate?")) return;
    try {
      await updateApplicantStatus(id, "rejected");
      mutate();
      setSelectedId(null);
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-gray-50 overflow-hidden">
      {/* Candidate List - Mobile Responsive */}
      <div
        className={`w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col h-full ${
          selectedId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">CV Inbox</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Blind Mode
              </span>
              <button
                onClick={() => setBlindMode(!blindMode)}
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  blindMode ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                    blindMode ? "translate-x-3.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            AI-screened candidates awaiting review
          </p>
        </div>

        {/* Candidate List */}
        <div className="flex-1 overflow-y-auto">
          {candidates.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedId(app.id)}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedId === app.id
                  ? "bg-gray-50 border-l-2 border-l-black"
                  : "border-l-2 border-l-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm text-gray-900 truncate pr-2">
                  {blindMode ? `Candidate ${app.id.slice(0, 4)}` : app.name}
                </span>
                <span
                  className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                    app.ai_score >= 80
                      ? "bg-green-100 text-green-700"
                      : app.ai_score >= 50
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {app.ai_score}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(app.created_at).toLocaleDateString()}</span>
                <span className="capitalize">{app.status}</span>
              </div>
            </div>
          ))}
          {candidates.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs mt-10">
              No candidates in CV Inbox
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel - Mobile Responsive */}
      <div
        className={`flex-1 flex flex-col h-full bg-gray-50 ${
          selectedId ? "flex" : "hidden md:flex"
        }`}
      >
        {/* Mobile Back Button */}
        <div className="md:hidden h-12 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
          <button
            onClick={() => setSelectedId(null)}
            className="text-sm font-medium text-gray-600 flex items-center gap-1"
          >
            ← Back
          </button>
        </div>

        {selectedCandidate ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {blindMode
                        ? `Candidate #${selectedCandidate.id.slice(0, 4)}`
                        : selectedCandidate.name}
                    </h1>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 font-mono">
                      <span>
                        {blindMode
                          ? "********@****.com"
                          : selectedCandidate.email}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>
                        Applied:{" "}
                        {new Date(
                          selectedCandidate.created_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right bg-gray-50 px-3 py-2 rounded border border-gray-100 min-w-[80px]">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                      AI Score
                    </div>
                    <div
                      className={`text-2xl font-black ${
                        selectedCandidate.ai_score >= 80
                          ? "text-black"
                          : "text-gray-600"
                      }`}
                    >
                      {selectedCandidate.ai_score}
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                {selectedCandidate.ai_reasoning && (
                  <div className="bg-black text-gray-300 rounded-lg p-5 font-mono text-xs sm:text-sm leading-relaxed border border-gray-800 shadow-sm">
                    <div className="flex items-center gap-2 text-green-500 mb-3 pb-3 border-b border-gray-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="font-bold tracking-wide text-xs">
                        AI ANALYSIS
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">
                      {selectedCandidate.ai_reasoning}
                    </p>
                  </div>
                )}

                {/* CV Content */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                    Resume Extraction
                  </h3>
                  <div className="font-mono text-xs sm:text-sm text-gray-600 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {selectedCandidate.cv_text}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex gap-3 justify-end items-center sticky bottom-0">
              <div className="mr-auto text-xs text-gray-400 font-mono hidden sm:block">
                ID: {selectedCandidate.id.slice(0, 8)}
              </div>
              <button
                onClick={() => handleReject(selectedCandidate.id)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded text-sm font-medium hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleMoveToInterview(selectedCandidate.id)}
                className="px-4 py-2 bg-black text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                Move to Interview
              </button>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 flex-col gap-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xl font-bold">
              ?
            </div>
            <p className="text-sm font-medium">
              Select a candidate to review details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
