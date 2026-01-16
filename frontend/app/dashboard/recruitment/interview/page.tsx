"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { getOrgApplicants, updateApplicantStatus } from "@/lib/api";

interface Applicant {
  id: string;
  name: string;
  email: string;
  project_name?: string;
  ai_score: number;
  status: string;
  created_at: string;
}

export default function InterviewPage() {
  const { data: allCandidates = [], mutate } = useSWR<Applicant[]>(
    "applicants-interview",
    getOrgApplicants,
    { refreshInterval: 10000 }
  );

  // Filter for interview_pending status
  const candidates = allCandidates.filter(
    (c) => c.status === "interview_pending"
  );

  async function handleApprove(id: string) {
    if (!confirm("Approve this candidate for verification?")) return;
    try {
      await updateApplicantStatus(id, "interview_approved");
      mutate();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Reject this candidate?")) return;
    try {
      await updateApplicantStatus(id, "rejected");
      mutate();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Interview Stage
        </h1>
        <p className="text-sm text-gray-500">
          Candidates who passed AI screening, awaiting manual interview approval
        </p>
      </div>

      {/* Table - Mobile Responsive */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  AI Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                        {candidate.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.name}
                        </div>
                        {candidate.project_name && (
                          <div className="text-xs text-gray-500">
                            {candidate.project_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {candidate.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        candidate.ai_score >= 80
                          ? "bg-green-100 text-green-800"
                          : candidate.ai_score >= 50
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {candidate.ai_score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(candidate.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleReject(candidate.id)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(candidate.id)}
                        className="px-3 py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {candidate.name}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {candidate.email}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    candidate.ai_score >= 80
                      ? "bg-green-100 text-green-800"
                      : candidate.ai_score >= 50
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {candidate.ai_score}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Applied: {new Date(candidate.created_at).toLocaleDateString()}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleReject(candidate.id)}
                  className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(candidate.id)}
                  className="flex-1 px-3 py-2 bg-black text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium">
              No candidates in interview stage
            </p>
            <p className="text-xs mt-1">
              Approved candidates from CV Inbox will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
