"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getProject,
  getApplicants,
  updateApplicantStatus,
  updateProject,
} from "@/lib/api";

export default function ProjectDashboard() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blindMode, setBlindMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [activeTab, setActiveTab] = useState<"priority" | "other">("priority");

  // Filter applicants
  const priorityApplicants = applicants.filter((a) => (a.ai_score || 0) >= 70);
  const otherApplicants = applicants.filter((a) => (a.ai_score || 0) < 70);
  const displayedApplicants =
    activeTab === "priority" ? priorityApplicants : otherApplicants;

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    const p = await getProject(id as string);
    setProject(p);
    setEditedName(p.name);
    const a = await getApplicants(id as string);
    setApplicants(a);
  }

  async function handleUpdateName() {
    if (!project || !editedName) return;
    await updateProject(project.id, editedName);
    setIsEditing(false);
    loadData();
  }

  async function handleStatus(applicantId: string, status: string) {
    await updateApplicantStatus(applicantId, status);
    loadData(); // Reload to update UI
    if (selectedId === applicantId) {
      // Keep selected?
    }
  }

  const selectedCandidate = applicants.find((a) => a.id === selectedId);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* Sidebar / List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2">
            {isEditing ? (
              <div className="flex gap-2 w-full">
                <input
                  className="flex-1 border rounded px-1 text-sm bg-white"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
                <button
                  onClick={handleUpdateName}
                  className="text-xs bg-green-100 text-green-800 px-2 rounded"
                >
                  ✓
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-400 px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group max-w-[80%]">
                <h2
                  className="font-bold text-lg truncate"
                  title={project?.name}
                >
                  {project?.name}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
                >
                  ✏️
                </button>
              </div>
            )}

            <a
              href="/dashboard"
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              Exit
            </a>
          </div>

          {/* Blind Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Blind Mode
            </span>
            <button
              onClick={() => setBlindMode(!blindMode)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                blindMode ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  blindMode ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="px-4 pb-2 flex gap-4 text-sm border-b border-gray-100">
          <button
            onClick={() => setActiveTab("priority")}
            className={`pb-2 border-b-2 font-medium transition-colors ${
              activeTab === "priority"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Priority Inbox ({priorityApplicants.length})
          </button>
          <button
            onClick={() => setActiveTab("other")}
            className={`pb-2 border-b-2 font-medium transition-colors ${
              activeTab === "other"
                ? "border-gray-500 text-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Others ({otherApplicants.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {displayedApplicants.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedId(app.id)}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedId === app.id
                  ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {blindMode ? `Candidate #${app.id.slice(0, 4)}` : app.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {blindMode ? "Email Hidden" : app.email}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      app.ai_score >= 80
                        ? "bg-green-100 text-green-800"
                        : app.ai_score >= 50
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    AI: {app.ai_score}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    app.status === "approved"
                      ? "bg-green-500 text-white"
                      : app.status === "rejected"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {app.status}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {displayedApplicants.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              {activeTab === "priority"
                ? "No high-scoring candidates yet."
                : "No other candidates."}
            </div>
          )}
        </div>
      </div>

      {/* Main Content / Detail */}
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        {selectedCandidate ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-3xl mx-auto">
              {/* Header Detail */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {blindMode
                      ? `Candidate #${selectedCandidate.id.slice(0, 8)}`
                      : selectedCandidate.name}
                  </h1>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>
                      {blindMode
                        ? "********@****.com"
                        : selectedCandidate.email}
                    </span>
                    <span>•</span>
                    <span>
                      Applied{" "}
                      {new Date(
                        selectedCandidate.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-black ${
                      selectedCandidate.ai_score >= 80
                        ? "text-green-600"
                        : selectedCandidate.ai_score >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedCandidate.ai_score}
                  </div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Fit Score
                  </div>
                </div>
              </div>

              {/* AI Reasoning Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-xl mb-8">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                  ✨ AI Analysis
                </h3>
                <p className="text-blue-800 leading-relaxed text-sm">
                  {selectedCandidate.ai_reasoning}
                </p>
              </div>

              {/* CV Content */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                  Resume / CV
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm whitespace-pre-wrap text-gray-700 leading-relaxed border border-gray-100">
                  {selectedCandidate.cv_text}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => handleStatus(selectedCandidate.id, "rejected")}
                  className="flex-1 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatus(selectedCandidate.id, "approved")}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
                >
                  Approve for Interview
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a candidate to review details
          </div>
        )}
      </div>
    </div>
  );
}
