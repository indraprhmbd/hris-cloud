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

  // Content Editor State
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");

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
    setDescription(p.description || "");
    setRequirements(p.requirements || "");
    setBenefits(p.benefits || "");
    const a = await getApplicants(id as string);
    setApplicants(a);
  }

  async function handleUpdateName() {
    if (!project || !editedName) return;
    await updateProject(project.id, { name: editedName });
    setIsEditing(false);
    loadData();
  }

  async function handleUpdateContent() {
    if (!project) return;
    await updateProject(project.id, {
      name: project.name, // Keep existing name
      description,
      requirements,
      benefits,
    });
    setIsContentModalOpen(false);
    loadData();
  }

  async function handleStatus(applicantId: string, status: string) {
    await updateApplicantStatus(applicantId, status);
    loadData(); // Reload to update UI
  }

  const selectedCandidate = applicants.find((a) => a.id === selectedId);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans text-gray-900 selection:bg-gray-200">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4 overflow-hidden">
          <a
            href={`/dashboard?orgId=${project?.org_id}`}
            className="text-gray-500 hover:text-black font-medium text-sm flex items-center gap-1"
          >
            ← <span className="hidden sm:inline">Back</span>
          </a>
          <div className="h-4 w-px bg-gray-200"></div>
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <input
                className="border rounded px-2 py-1 text-sm outline-none focus:border-black"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                autoFocus
              />
              <button
                onClick={handleUpdateName}
                className="text-xs bg-black text-white px-2 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-500 hover:text-black"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <h1 className="font-semibold text-sm sm:text-base text-gray-900 truncate max-w-[200px] sm:max-w-md">
                {project?.name || "Loading..."}
              </h1>
              <span className="text-gray-400 group-hover:text-black opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                edit
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => setBlindMode(!blindMode)}
              className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                blindMode
                  ? "bg-black text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Blind Mode
            </button>
          </div>
          <button
            onClick={() => setIsContentModalOpen(true)}
            className="text-xs sm:text-sm font-medium border border-gray-200 hover:border-black px-3 py-1.5 rounded transition-colors"
          >
            Properties
          </button>
          <a
            href={`/career/${id}`}
            target="_blank"
            className="text-xs sm:text-sm font-medium bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
          >
            View Live
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar List */}
        <div
          className={`w-full sm:w-80 md:w-96 bg-white border-r border-gray-200 flex flex-col absolute sm:relative h-full z-10 transition-transform ${
            selectedId ? "-translate-x-full sm:translate-x-0" : "translate-x-0"
          }`}
        >
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("priority")}
              className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "priority"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Priority ({priorityApplicants.length})
            </button>
            <button
              onClick={() => setActiveTab("other")}
              className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "other"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              All Candidates ({otherApplicants.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {displayedApplicants.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedId(app.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedId === app.id
                    ? "bg-gray-50 border-l-2 border-l-black"
                    : "border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-gray-900 block truncate pr-2">
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
                    SCORE: {app.ai_score}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  <span
                    className={`capitalize ${
                      app.status === "approved"
                        ? "text-green-600 font-medium"
                        : app.status === "rejected"
                        ? "text-red-600"
                        : ""
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
            {displayedApplicants.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-xs">
                No candidates found
              </div>
            )}
          </div>
        </div>

        {/* Main Detail Area */}
        <div
          className={`flex-1 bg-gray-50 flex flex-col h-full w-full absolute sm:relative transition-transform ${
            selectedId ? "translate-x-0" : "translate-x-full sm:translate-x-0"
          }`}
        >
          {selectedCandidate ? (
            <div className="flex flex-col h-full">
              {/* Mobile Back Button */}
              <div className="sm:hidden bg-white border-b border-gray-200 p-2">
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-sm font-medium text-gray-600 flex items-center gap-1"
                >
                  ← Back to List
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Profile Header */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {blindMode
                          ? `Candidate ${selectedCandidate.id.slice(0, 8)}`
                          : selectedCandidate.name}
                      </h2>
                      <div className="text-sm text-gray-500 font-mono">
                        {blindMode
                          ? "contact_hidden@blind.mode"
                          : selectedCandidate.email}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide border ${
                            selectedCandidate.status === "approved"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : selectedCandidate.status === "rejected"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          Status: {selectedCandidate.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right p-4 bg-gray-50 rounded-lg border border-gray-100 min-w-[140px]">
                      <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">
                        AI Match Score
                      </div>
                      <div className="text-4xl font-black tracking-tighter text-gray-900">
                        {selectedCandidate.ai_score}
                      </div>
                    </div>
                  </div>

                  {/* AI Log */}
                  <div className="bg-black text-gray-300 rounded-lg p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto border border-gray-800 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-3 pb-3 border-b border-gray-800">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span>SYSTEM_LOG::EVALUATION_OUPUT</span>
                    </div>
                    <p className="whitespace-pre-wrap">
                      {selectedCandidate.ai_reasoning}
                    </p>
                  </div>

                  {/* CV Viewer */}
                  <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      Extracted Resume Data
                    </h3>
                    <div className="font-mono text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {selectedCandidate.cv_text}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex gap-4 justify-end">
                <button
                  onClick={() => handleStatus(selectedCandidate.id, "rejected")}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                >
                  Reject Candidate
                </button>
                <button
                  onClick={() => handleStatus(selectedCandidate.id, "approved")}
                  className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Approve for Interview
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex flex-1 items-center justify-center text-gray-400 text-sm">
              Select a candidate from the sidebar to view details.
            </div>
          )}
        </div>
      </div>

      {/* Content Editor Modal (Reused Logic, Updated Style) */}
      {isContentModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-sm text-gray-900">
                Career Page Configuration
              </h3>
              <button
                onClick={() => setIsContentModalOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                  Job Description
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-md bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition font-sans min-h-[100px]"
                  placeholder="Describe the role and responsibilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                  Requirements
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-md bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition font-sans min-h-[100px]"
                  placeholder="- Proficiency in Python..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                  Benefits
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-md bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition font-sans min-h-[100px]"
                  placeholder="- Health Insurance..."
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsContentModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateContent}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
