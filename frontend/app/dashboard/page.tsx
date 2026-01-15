"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  createOrganization,
  getOrganizations,
  createProject,
  getProjects,
  generateApiKey,
  updateProject,
  getApplicants,
} from "@/lib/api";
import CandidateTable from "./components/CandidateTable";
import ProjectTable from "./components/ProjectTable";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgIdFromUrl = searchParams.get("orgId");

  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"candidates" | "projects">(
    "candidates"
  );

  const [newOrgName, setNewOrgName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);

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

      // Fetch applicants for each project
      const projectsWithApplicants = await Promise.all(
        data.map(async (project: any) => {
          try {
            const applicants = await getApplicants(project.id);
            return { ...project, applicants };
          } catch (e) {
            console.error(
              `Failed to load applicants for project ${project.id}`,
              e
            );
            return { ...project, applicants: [] };
          }
        })
      );

      setProjects(projectsWithApplicants);
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

  async function handleToggleProjectStatus(
    projectId: string,
    isActive: boolean
  ) {
    try {
      await updateProject(projectId, { is_active: isActive });
      loadProjects(selectedOrg!);
    } catch (e: any) {
      alert("Failed to update project status: " + e.message);
    }
  }

  function handleProjectClick(project: any) {
    router.push(`/dashboard/project/${project.id}`);
  }

  function handleCandidateClick(candidate: any) {
    // Navigate to project with candidate selected
    router.push(`/dashboard/project/${candidate.project_id}`);
  }

  // Aggregate all candidates from all projects
  const allCandidates = projects.flatMap((project) =>
    (project.applicants || []).map((applicant: any) => ({
      ...applicant,
      project_name: project.name,
    }))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {selectedOrg ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  Control Panel
                </h2>
                <span className="text-gray-300">/</span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrg || ""}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                    className="bg-transparent text-sm font-medium text-gray-700 hover:text-black focus:outline-none cursor-pointer border-b border-transparent hover:border-gray-300 transition-colors"
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
              <p className="text-sm text-gray-500">
                Manage candidates and recruitment projects
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-shadow shadow-sm w-full sm:w-auto"
            >
              Create Project
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("candidates")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "candidates"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Candidates ({allCandidates.length})
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "projects"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Projects ({projects.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "candidates" ? (
            <CandidateTable
              candidates={allCandidates}
              onRowClick={handleCandidateClick}
            />
          ) : (
            <ProjectTable
              projects={projects}
              onToggleStatus={handleToggleProjectStatus}
              onRowClick={handleProjectClick}
            />
          )}
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

      {/* Create Project Modal */}
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
                  <strong>Standard Enterprise</strong> schema. You can customize
                  job descriptions and requirements after creation.
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
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
