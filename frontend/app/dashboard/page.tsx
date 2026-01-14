"use client";

import { useEffect, useState } from "react";
import {
  createOrganization,
  getOrganizations,
  createProject,
  getProjects,
  generateApiKey,
} from "@/lib/api";

export default function Dashboard() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  // Auth state is handled by Middleware/Supabase helper in api.ts
  // If API calls fail due to 401, we might want to catch that, but Middleware protects route.
  const [newOrgName, setNewOrgName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false); // Project Modal
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false); // Org Modal
  const [selectedTemplate, setSelectedTemplate] = useState("template-modern");

  const templates = [
    {
      id: "template-modern",
      name: "Modern Tech",
      desc: "Dark mode, gradients, tech-forward.",
      color: "bg-slate-900 text-white",
    },
    {
      id: "template-classic",
      name: "Classic Corporate",
      desc: "Clean white, professional, serif fonts.",
      color: "bg-white border-2 border-gray-100",
    },
    {
      id: "template-creative",
      name: "Creative Startup",
      desc: "Vibrant colors, rounded shapes, friendly.",
      color: "bg-yellow-50 border-2 border-yellow-200",
    },
  ];

  useEffect(() => {
    loadOrgs();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadProjects(selectedOrg);
    }
  }, [selectedOrg]);

  async function loadOrgs() {
    try {
      const data = await getOrganizations();
      setOrgs(data);
      if (data.length > 0 && !selectedOrg) setSelectedOrg(data[0].id);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadProjects(orgId: string) {
    try {
      const data = await getProjects(orgId);
      setProjects(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateOrg() {
    if (!newOrgName) return;
    await createOrganization(newOrgName);
    setNewOrgName("");
    setIsOrgModalOpen(false);
    loadOrgs();
  }

  async function handleCreateProject() {
    if (!newProjectName || !selectedOrg) return;
    try {
      await createProject(selectedOrg, newProjectName, selectedTemplate);
      setNewProjectName("");
      setIsModalOpen(false);
      loadProjects(selectedOrg);
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  }

  async function handleGenerateKey(projectId: string) {
    const data = await generateApiKey(projectId);
    setApiKey(data.key_value);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Platform Dashboard
            </h1>
            <p className="text-gray-500 text-sm">Manage your AI HR Systems</p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedOrg || ""}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="p-2 border rounded-md text-sm bg-gray-50 max-w-[200px]"
            >
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsOrgModalOpen(true)}
              className="bg-gray-900 text-white w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-gray-700"
              title="Create New Organization"
            >
              +
            </button>
          </div>
        </header>

        {/* Projects List */}
        {selectedOrg && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Projects</h2>

              {/* New Project Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-medium flex items-center gap-2"
              >
                <span>+</span> New Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {project.name}
                      </h3>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                        Active
                      </span>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => handleGenerateKey(project.id)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600"
                      >
                        Gen API Key
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500">
                    <p>
                      Template:{" "}
                      <span className="font-medium text-gray-700">
                        {project.template_id}
                      </span>
                    </p>
                    <p>
                      ID:{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        {project.id}
                      </code>
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <a
                      href={`/dashboard/project/${project.id}`}
                      className="flex-1 text-center bg-white border border-gray-200 text-gray-900 py-2 rounded text-sm hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Manage System
                    </a>
                    <a
                      href={`/career/${project.id}`}
                      target="_blank"
                      className="flex-1 text-center bg-black text-white py-2 rounded text-sm hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      View Career Page
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Key Modal/Toast (Simple alert for MVP) */}
        {apiKey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl max-w-md w-full space-y-4">
              <h3 className="text-lg font-bold">API Key Generated</h3>
              <p className="text-sm text-gray-600">
                Save this key, it wont be shown again.
              </p>
              <code className="block bg-gray-100 p-4 rounded text-wrap break-all border border-gray-200 font-mono text-sm text-red-600">
                {apiKey}
              </code>
              <button
                onClick={() => setApiKey(null)}
                className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Create Org Modal */}
        {isOrgModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Create Organization</h3>
              <input
                className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Acme Corp"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOrgModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrg}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Create New Project
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Project Name / Job Title
                  </label>
                  <input
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Choose Template
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative ${
                          selectedTemplate === t.id
                            ? "border-indigo-600 ring-4 ring-indigo-50"
                            : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`h-24 w-full rounded-lg mb-3 ${t.color} flex items-center justify-center shadow-inner`}
                        >
                          <span className="text-xs font-bold opacity-50">
                            Preview
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-900">
                          {t.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {t.desc}
                        </p>

                        {selectedTemplate === t.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 shadow-lg"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
