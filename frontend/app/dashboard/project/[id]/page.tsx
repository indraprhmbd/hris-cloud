"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getProject,
  getApplicants,
  updateApplicantStatus,
  updateProject,
  convertApplicantToEmployee,
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
    <div className="flex h-[calc(100vh-3.5rem)] font-sans text-gray-900 bg-gray-50 overflow-hidden">
      {/* Sidebar / List - Height 100% of container */}
      <div className="w-full sm:w-1/3 bg-white border-r border-gray-200 flex flex-col h-full z-10">
        {/* Local Toolbar */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Project Controls
              </span>
            </div>
            {/* Blind Mode Toggle Localized */}
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  blindMode ? "text-indigo-600" : "text-gray-400"
                }`}
              >
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

          <div className="flex gap-2">
            {isEditing ? (
              <div className="flex gap-1 w-full">
                <input
                  className="flex-1 border rounded px-2 py-1 text-sm bg-gray-50"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Project Name"
                />
                <button
                  onClick={handleUpdateName}
                  className="text-xs bg-black text-white px-2 rounded"
                >
                  ✓
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-500 px-2"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center w-full">
                <h2
                  className="font-bold text-lg truncate flex-1"
                  title={project?.name}
                >
                  {project?.name || "Loading..."}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-black p-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setIsContentModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-200 hover:border-black text-gray-700 py-1.5 rounded text-xs font-medium transition-colors"
            >
              <span>⚙️</span> Configure Page
            </button>
            <a
              href={`/career/${id}`}
              target="_blank"
              className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium transition-colors"
            >
              <span>↗</span> View Live
            </a>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-4 pt-1 flex gap-4 text-xs font-medium border-b border-gray-100 shrink-0">
          <button
            onClick={() => setActiveTab("priority")}
            className={`pb-2 border-b-2 transition-colors flex-1 text-center ${
              activeTab === "priority"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Priority Inbox ({priorityApplicants.length})
          </button>
          <button
            onClick={() => setActiveTab("other")}
            className={`pb-2 border-b-2 transition-colors flex-1 text-center ${
              activeTab === "other"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            All Candidates ({otherApplicants.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-gray-200">
          {displayedApplicants.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedId(app.id)}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors group ${
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
                <span
                  className={`capitalize ${
                    app.status === "hired"
                      ? "text-blue-600 font-bold"
                      : app.status === "approved"
                      ? "text-green-600 font-medium"
                      : app.status === "rejected"
                      ? "text-red-600"
                      : app.status === "interview"
                      ? "text-purple-600 font-medium"
                      : ""
                  }`}
                >
                  {app.status}
                </span>
              </div>
            </div>
          ))}
          {displayedApplicants.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs mt-10">
              No candidates found
            </div>
          )}
        </div>
      </div>

      {/* Main Content / Detail */}
      <div
        className={`flex-1 flex flex-col h-full bg-gray-50 w-full absolute sm:relative z-20 sm:z-0 transition-transform ${
          selectedId ? "translate-x-0" : "translate-x-full sm:translate-x-0"
        }`}
      >
        {/* Mobile Back Header */}
        <div className="sm:hidden h-12 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
          <button
            onClick={() => setSelectedId(null)}
            className="text-sm font-medium text-gray-600 flex items-center gap-1"
          >
            ← Back
          </button>
        </div>

        {selectedCandidate ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header Detail */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex justify-between items-start gap-4">
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
                    Fit Score
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

              {/* AI Reasoning Box */}
              <div className="bg-black text-gray-300 rounded-lg p-5 font-mono text-xs sm:text-sm leading-relaxed border border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-50 text-[10px] uppercase tracking-widest font-bold text-gray-600">
                  AI Analysis Module
                </div>
                <div className="flex items-center gap-2 text-green-500 mb-3 pb-3 border-b border-gray-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-bold tracking-wide text-xs">
                    ANALYSIS_LOG
                  </span>
                </div>
                <p className="whitespace-pre-wrap">
                  {selectedCandidate.ai_reasoning}
                </p>
              </div>

              {/* CV Content */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                  Resume Extraction
                </h3>
                <div className="font-mono text-xs sm:text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {selectedCandidate.cv_text}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex flex-1 items-center justify-center text-gray-400 flex-col gap-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xl font-bold">
              ?
            </div>
            <p className="text-sm font-medium">
              Select a candidate to review details
            </p>
          </div>
        )}

        {/* Footer Actions */}
        {selectedCandidate && (
          <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex gap-3 justify-end items-center sticky bottom-0 z-30">
            <div className="mr-auto text-xs text-gray-400 font-mono hidden sm:block">
              ID: {selectedCandidate.id}
            </div>

            {selectedCandidate.status === "hired" ? (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded text-sm font-bold">
                ✓ Hired & Onboarded
              </span>
            ) : (
              <>
                <button
                  onClick={() => handleStatus(selectedCandidate.id, "rejected")}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded text-sm font-medium hover:bg-gray-50 hover:text-red-600 transition-colors"
                >
                  Reject
                </button>

                {/* Flow Control */}
                {selectedCandidate.status === "processing" && (
                  <button
                    onClick={() =>
                      handleStatus(selectedCandidate.id, "interview")
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Move to Interview
                  </button>
                )}

                {selectedCandidate.status === "interview" && (
                  <button
                    onClick={() =>
                      handleStatus(selectedCandidate.id, "approved")
                    }
                    className="px-4 py-2 bg-black text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Approve for Hire
                  </button>
                )}

                {selectedCandidate.status === "approved" && (
                  <button
                    onClick={async () => {
                      try {
                        if (
                          !confirm("Create employee record for this candidate?")
                        )
                          return;
                        await convertApplicantToEmployee(selectedCandidate.id);
                        alert("Employee record created successfully!");
                        loadData();
                      } catch (e: any) {
                        alert(e.message);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <span>+</span> Add to Employee Database
                  </button>
                )}
              </>
            )}
          </div>
        )}
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
