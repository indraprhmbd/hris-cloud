"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { getOrgApplicants } from "@/lib/api";

interface Applicant {
  id: string;
  name: string;
  email: string;
  project_name?: string;
  ai_score: number;
  status: string;
  created_at: string;
}

export default function VerificationPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    department: "",
    role: "",
    join_date: new Date().toISOString().split("T")[0],
    leave_remaining: 12,
  });

  const { data: allCandidates = [], mutate } = useSWR<Applicant[]>(
    "applicants-verification",
    getOrgApplicants,
    { refreshInterval: 10000 }
  );

  // Filter for interview_approved status
  const candidates = allCandidates.filter(
    (c) => c.status === "interview_approved"
  );

  const selectedCandidate = candidates.find((c) => c.id === selectedId);

  async function handleVerifyAndConvert() {
    if (!selectedCandidate) return;
    if (!formData.department || !formData.role) {
      alert("Please fill in all required fields");
      return;
    }

    if (
      !confirm(
        `Convert ${selectedCandidate.name} to employee with role: ${formData.role}?`
      )
    )
      return;

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(
        `${API_URL}/applicants/${selectedCandidate.id}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to verify candidate");
      }

      alert("Candidate successfully verified and hired!");
      setSelectedId(null);
      setFormData({
        department: "",
        role: "",
        join_date: new Date().toISOString().split("T")[0],
        leave_remaining: 12,
      });
      mutate();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verification & Onboarding
        </h1>
        <p className="text-sm text-gray-500">
          Final data entry before converting candidates to employees
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-sm text-gray-900">
              Approved Candidates
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {candidates.length} awaiting verification
            </p>
          </div>

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => setSelectedId(candidate.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedId === candidate.id
                    ? "bg-blue-50 border-l-2 border-l-blue-600"
                    : "border-l-2 border-l-transparent"
                }`}
              >
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
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {candidate.ai_score}
                  </span>
                </div>
              </div>
            ))}

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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium">No candidates to verify</p>
                <p className="text-xs mt-1">
                  Approved candidates from Interview will appear here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-sm text-gray-900">
              Employee Data Entry
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Fill complete information before conversion
            </p>
          </div>

          {selectedCandidate ? (
            <div className="p-6 space-y-6">
              {/* Candidate Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                    {selectedCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {selectedCandidate.name}
                    </div>
                    <div className="text-xs text-gray-600 font-mono">
                      {selectedCandidate.email}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  AI Score: {selectedCandidate.ai_score}/100 • Applied:{" "}
                  {new Date(selectedCandidate.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role / Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={formData.join_date}
                    onChange={(e) =>
                      setFormData({ ...formData, join_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Leave Balance (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.leave_remaining}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leave_remaining: parseInt(e.target.value),
                      })
                    }
                    min="0"
                    max="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default: 12 days per year
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleVerifyAndConvert}
                disabled={!formData.department || !formData.role}
                className="w-full px-4 py-3 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
              >
                ✓ Verify & Convert to Employee
              </button>
            </div>
          ) : (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium">Select a candidate</p>
              <p className="text-xs mt-1">
                Choose a candidate from the list to fill their employee data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
