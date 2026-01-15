"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  createOrganization,
  getOrganizations,
  createProject,
  getProjects,
  generateApiKey,
} from "@/lib/api";

function DashboardContent() {
  const searchParams = useSearchParams();
  const orgIdFromUrl = searchParams.get("orgId");
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  const [newOrgName, setNewOrgName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false); // Project Modal
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false); // Org Modal

  // Standardized Template (Enterprise Default)
  const defaultTemplate = "template-enterprise";

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
      if (data.length > 0) {
        if (orgIdFromUrl) {
          setSelectedOrg(orgIdFromUrl);
        } else if (!selectedOrg) {
          setSelectedOrg(data[0].id);
        }
      }
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
      // Always use the standard template ID, logically mapped to our single new design
      await createProject(selectedOrg, newProjectName, "template-modern");
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-gray-200">
      {/* Navbar / Top Control */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              <div className="w-4 h-4 bg-black rounded-sm" />
              <span className="hidden sm:inline">HRIS Cloud</span>
            </div>
            <div className="h-4 w-px bg-gray-200 mx-2 hidden sm:block"></div>

            {/* Org Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedOrg || ""}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 hover:text-black focus:outline-none cursor-pointer"
              >
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsOrgModalOpen(true)}
                className="text-gray-400 hover:text-black transition-colors"
                title="New Organization"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded hidden md:block">
            org_id: {selectedOrg}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {selectedOrg ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  Projects
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage recruitment instances and API access.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-shadow shadow-sm w-full sm:w-auto"
              >
                Create Project
              </button>
            </div>

            {/* Projects Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr
                        key={project.id}
                        className="hover:bg-gray-50 table-row"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {project.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <code className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {project.id.slice(0, 8)}...
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                          <button
                            onClick={() => handleGenerateKey(project.id)}
                            className="text-gray-500 hover:text-black transition-colors text-xs uppercase"
                          >
                            API Key
                          </button>
                          <a
                            href={`/dashboard/project/${project.id}`}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            Manage
                          </a>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          No projects found. Create one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Please select or create an organization.
          </div>
        )}

        {/* API Key Modal */}
        {apiKey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                API Key Generated
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                This key allows external systems to submit candidates to this
                project. It will not be shown again.
              </p>
              <div className="bg-gray-100 p-3 rounded border border-gray-200 mb-6 font-mono text-sm break-all text-gray-800">
                {apiKey}
              </div>
              <button
                onClick={() => setApiKey(null)}
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Create Org Modal */}
        {isOrgModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                New Organization
              </h3>
              <input
                className="w-full p-2.5 border border-gray-300 rounded-md mb-6 focus:ring-1 focus:ring-black focus:border-black outline-none transition text-sm"
                placeholder="Organization Name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsOrgModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrg}
                  className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Project Modal - Simplified */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">New Project</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition text-sm"
                    placeholder="e.g. Q1 Hiring - Senior Backend"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-600">
                  <p>
                    This will create a new recruitment instance using the{" "}
                    <strong>Standard Enterprise</strong> schema. You can
                    customize job descriptions and requirements after creation.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
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

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
