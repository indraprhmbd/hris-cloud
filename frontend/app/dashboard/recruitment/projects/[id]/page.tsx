"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { getProject, getApplicants, updateProject } from "@/lib/api";
import { ArrowLeft, Edit2, Save, X, ExternalLink } from "lucide-react";

interface Project {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  description?: string;
  requirements?: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  status: string;
  ai_score: number;
  created_at: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    requirements: "",
  });

  const { data: project, mutate: mutateProject } = useSWR<Project>(
    projectId ? `project-${projectId}` : null,
    () => getProject(projectId)
  );

  const { data: applicants = [] } = useSWR<Applicant[]>(
    projectId ? `project-${projectId}-applicants` : null,
    () => getApplicants(projectId)
  );

  const stats = {
    total: applicants.length,
    processing: applicants.filter(
      (a) => a.status === "processing" || a.status === "interview_pending"
    ).length,
    interview: applicants.filter((a) => a.status === "interview_pending")
      .length,
    verification: applicants.filter((a) => a.status === "interview_approved")
      .length,
    hired: applicants.filter((a) => a.status === "hired").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
  };

  function handleEdit() {
    if (project) {
      setEditData({
        name: project.name,
        description: project.description || "",
        requirements: project.requirements || "",
      });
      setIsEditing(true);
    }
  }

  async function handleSave() {
    try {
      await updateProject(projectId, editData);
      setIsEditing(false);
      mutateProject();
    } catch (e: any) {
      alert(e.message);
    }
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/recruitment/projects")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="text-2xl font-bold text-gray-900 border-b-2 border-black focus:outline-none w-full"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={`${window.location.origin}/career/${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Career Page
            </a>

            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Total
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {stats.processing}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            CV Inbox
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {stats.interview}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Interview
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-600">
            {stats.verification}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Verification
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Hired
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {stats.rejected}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Rejected
          </div>
        </div>
      </div>

      {/* Career Page Content Editor */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-900">
            Career Page Content
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            This content will be displayed on the public career page
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                rows={6}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
              />
            ) : (
              <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                {project.description ||
                  "No description yet. Click Edit to add one."}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            {isEditing ? (
              <textarea
                value={editData.requirements}
                onChange={(e) =>
                  setEditData({ ...editData, requirements: e.target.value })
                }
                rows={6}
                placeholder="List the required skills, experience, and qualifications..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
              />
            ) : (
              <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                {project.requirements ||
                  "No requirements yet. Click Edit to add them."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Applicants Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-900">All Applicants</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {applicants.length} total applicants for this project
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  AI Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applicants.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {app.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        app.ai_score >= 80
                          ? "bg-green-100 text-green-800"
                          : app.ai_score >= 50
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {app.ai_score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        app.status === "hired"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : app.status === "interview_approved"
                          ? "bg-amber-100 text-amber-700"
                          : app.status === "interview_pending"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {applicants.map((app) => (
            <div key={app.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {app.name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {app.email}
                  </div>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    app.ai_score >= 80
                      ? "bg-green-100 text-green-800"
                      : app.ai_score >= 50
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {app.ai_score}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span
                  className={`inline-flex px-2 py-1 font-medium rounded-full capitalize ${
                    app.status === "hired"
                      ? "bg-green-100 text-green-700"
                      : app.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : app.status === "interview_approved"
                      ? "bg-amber-100 text-amber-700"
                      : app.status === "interview_pending"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {app.status.replace("_", " ")}
                </span>
                <span className="text-gray-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {applicants.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">No applicants yet for this project</p>
          </div>
        )}
      </div>
    </div>
  );
}
