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
    loadOrgs();
  }

  async function handleCreateProject() {
    if (!newProjectName || !selectedOrg) return;
    try {
      await createProject(selectedOrg, newProjectName, "recruitment-ai-v1");
      setNewProjectName("");
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
              className="p-2 border rounded-md text-sm bg-gray-50"
            >
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Create Org Section */}
        {orgs.length === 0 && (
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Create Organization
              </label>
              <input
                className="w-full p-2 rounded border border-blue-200"
                placeholder="e.g. Acme Corp"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
            <button
              onClick={handleCreateOrg}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        )}

        {/* Projects List */}
        {selectedOrg && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Projects</h2>

              {/* New Project Input (Mini form for MVP) */}
              <div className="flex gap-2">
                <input
                  className="p-2 border rounded text-sm w-64"
                  placeholder="New Project Name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <button
                  onClick={handleCreateProject}
                  className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                >
                  + New Project
                </button>
              </div>
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
      </div>
    </div>
  );
}
