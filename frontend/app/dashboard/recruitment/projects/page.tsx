"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  getProjects,
  getOrgApplicants,
  deleteProject,
  updateProject,
} from "@/lib/api";
import { Trash2, Plus, ExternalLink, Edit2, X } from "lucide-react";

interface Project {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface Applicant {
  id: string;
  project_id: string;
  status: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [newProjectName, setNewProjectName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");

  const { data: projects = [], mutate: mutateProjects } = useSWR<Project[]>(
    "projects-management",
    getProjects
  );

  const { data: applicants = [] } = useSWR<Applicant[]>(
    "applicants-for-projects",
    getOrgApplicants
  );

  async function handleCreateProject() {
    if (!newProjectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          template_id: "template-modern",
        }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      setNewProjectName("");
      setIsModalOpen(false);
      mutateProjects();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleUpdateProject() {
    if (!editingProject || !editName.trim()) return;

    try {
      await updateProject(editingProject.id, { name: editName });
      setEditingProject(null);
      setEditName("");
      mutateProjects();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleToggleStatus(projectId: string, isActive: boolean) {
    try {
      await updateProject(projectId, { is_active: isActive });
      mutateProjects();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleDelete(projectId: string) {
    if (
      !confirm(
        "Archive this project? All associated candidates will be hidden."
      )
    )
      return;

    try {
      await deleteProject(projectId);
      mutateProjects();
    } catch (e: any) {
      alert(e.message);
    }
  }

  function getProjectStats(projectId: string) {
    const projectApplicants = applicants.filter(
      (a) => a.project_id === projectId
    );
    return {
      total: projectApplicants.length,
      inbox: projectApplicants.filter(
        (a) => a.status === "processing" || a.status === "interview_pending"
      ).length,
      interview: projectApplicants.filter(
        (a) => a.status === "interview_pending"
      ).length,
      hired: projectApplicants.filter((a) => a.status === "hired").length,
    };
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Project Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage recruitment projects and their career pages
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const stats = getProjectStats(project.id);
          return (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingProject(project);
                          setEditName(project.name);
                        }}
                        className="text-gray-400 hover:text-black transition-colors"
                        title="Edit project name"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() =>
                        handleToggleStatus(project.id, !project.is_active)
                      }
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        project.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {project.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 mb-4 py-3 border-y border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {stats.total}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Total
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {stats.inbox}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Inbox
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {stats.interview}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Interview
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {stats.hired}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Hired
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={`${window.location.origin}/career/${project.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Career Page
                  </a>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-3 py-2 border border-gray-200 text-gray-500 rounded text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No Projects Yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first recruitment project to start receiving
            applications
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Create Project
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Create New Project
            </h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. Q1 2026 - Senior Backend Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm mb-6"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewProjectName("");
                }}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Project</h2>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setEditName("");
                }}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Project name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm mb-6"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setEditingProject(null);
                  setEditName("");
                }}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
