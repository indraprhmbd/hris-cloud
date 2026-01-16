"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { getProjects, getOrgApplicants } from "@/lib/api";
import Link from "next/link";
import { Users, FileText, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface Project {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  status: string;
  ai_score: number;
  created_at: string;
}

export default function DashboardOverview() {
  const { data: projects = [] } = useSWR<Project[]>("projects", getProjects);
  const { data: applicants = [] } = useSWR<Applicant[]>(
    "applicants-overview",
    getOrgApplicants,
    { refreshInterval: 10000 }
  );

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.is_active).length,
    totalApplicants: applicants.length,
    inboxCount: applicants.filter(
      (a) => a.status === "processing" || a.status === "interview_pending"
    ).length,
    interviewCount: applicants.filter((a) => a.status === "interview_pending")
      .length,
    verificationCount: applicants.filter(
      (a) => a.status === "interview_approved"
    ).length,
    hiredCount: applicants.filter((a) => a.status === "hired").length,
  };

  const recentApplicants = applicants
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500">
          Welcome to HARIS - Your AI-Assisted HR Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/dashboard/recruitment/inbox"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              CV Inbox
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">
            {stats.inboxCount}
          </div>
          <div className="text-xs text-gray-500">Awaiting review</div>
        </Link>

        <Link
          href="/dashboard/recruitment/interview"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Interview
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">
            {stats.interviewCount}
          </div>
          <div className="text-xs text-gray-500">Pending approval</div>
        </Link>

        <Link
          href="/dashboard/recruitment/verification"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Verification
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">
            {stats.verificationCount}
          </div>
          <div className="text-xs text-gray-500">Ready to onboard</div>
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Hired
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">
            {stats.hiredCount}
          </div>
          <div className="text-xs text-gray-500">Total conversions</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applicants */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-sm text-gray-900">
                Recent Applicants
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Latest {recentApplicants.length} submissions
              </p>
            </div>
            <Link
              href="/dashboard/recruitment/inbox"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentApplicants.map((app) => (
              <div
                key={app.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {app.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {app.email}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="capitalize">
                    {app.status.replace("_", " ")}
                  </span>
                  <span>•</span>
                  <span>{new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {recentApplicants.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-xs">
                No applicants yet
              </div>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-sm text-gray-900">Active Projects</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats.activeProjects} of {stats.totalProjects} projects active
            </p>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {projects
              .filter((p) => p.is_active)
              .map((project) => {
                const projectApplicants = applicants.filter(
                  (a) => a.status !== "rejected"
                );
                return (
                  <div
                    key={project.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {project.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created{" "}
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        <Users className="w-3 h-3" />
                        {projectApplicants.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            {stats.activeProjects === 0 && (
              <div className="p-8 text-center text-gray-400 text-xs">
                No active projects
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-br from-black to-gray-800 rounded-lg p-6 text-white">
        <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/recruitment/inbox"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-colors border border-white/10"
          >
            <div className="text-sm font-medium mb-1">Review CVs</div>
            <div className="text-xs text-gray-300">
              {stats.inboxCount} candidates waiting
            </div>
          </Link>
          <Link
            href="/dashboard/employees"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-colors border border-white/10"
          >
            <div className="text-sm font-medium mb-1">Manage Employees</div>
            <div className="text-xs text-gray-300">View employee database</div>
          </Link>
          <Link
            href="/dashboard/policy"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-colors border border-white/10"
          >
            <div className="text-sm font-medium mb-1">Policy Management</div>
            <div className="text-xs text-gray-300">
              Upload & monitor policies
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
