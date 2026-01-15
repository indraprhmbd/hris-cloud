"use client";

import { useState } from "react";

interface Project {
  id: string;
  name: string;
  is_active: boolean;
  org_id: string;
  template_id: string;
  created_at: string;
}

interface ProjectTableProps {
  projects: Project[];
  onToggleStatus: (projectId: string, isActive: boolean) => void;
  onRowClick: (project: Project) => void;
}

export default function ProjectTable({
  projects,
  onToggleStatus,
  onRowClick,
}: ProjectTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => onRowClick(project)}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {project.name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {project.id.slice(0, 8)}...
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      project.is_active
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {project.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                  {new Date(project.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 hidden sm:inline">
                        {project.is_active ? "Accepting CVs" : "Closed"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(project.id, !project.is_active);
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          project.is_active ? "bg-green-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            project.is_active
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No projects found
        </div>
      )}
    </div>
  );
}
