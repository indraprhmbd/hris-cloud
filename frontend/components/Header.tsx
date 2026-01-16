"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function Header() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    getUser();
    getProjects();
  }, []);

  useEffect(() => {
    if (params.id && projects.length > 0) {
      const p = projects.find((p) => p.id === params.id);
      setCurrentProject(p);
    } else {
      setCurrentProject(null);
    }
  }, [params.id, projects]);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  async function getProjects() {
    // In a real app, strict RLS would filter this.
    // For now assuming we fetch all or current user's projects.
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${API_URL}/projects`); // This endpoint might need auth headers in real prod
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error("Failed to fetch projects for header", e);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const projectId = params.id;

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    return pathname.startsWith(path) && path !== "/dashboard";
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50 font-sans text-sm selection:bg-gray-200">
      {/* Left: Context */}
      <div className="flex items-center gap-4">
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="font-bold text-gray-900 tracking-tight hidden sm:inline">
            HRIS Cloud
          </span>
        </div>

        <div className="h-4 w-px bg-gray-200 rotate-12 mx-1"></div>

        {/* User / Org Context */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border border-gray-200"></div>
          <span className="font-medium text-gray-700 truncate max-w-[100px]">
            {user?.email ? user.email.split("@")[0] : "Organization"}
          </span>
        </div>

        {/* Project Context (Dropdown style) */}
        {currentProject && (
          <>
            <span className="text-gray-300">/</span>
            <div className="relative group">
              <button className="flex items-center gap-1 font-medium text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                {currentProject.name}
                <svg
                  className="w-3 h-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {/* Simple Dropdown for Switching */}
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 shadow-lg rounded-lg py-1 hidden group-hover:block">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-50">
                  Switch Project
                </div>
                {projects.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/project/${p.id}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                  >
                    {p.name}
                  </Link>
                ))}
                <Link
                  href={`/dashboard`}
                  className="block px-4 py-2 text-gray-500 hover:bg-gray-50 hover:text-black transition-colors border-t border-gray-50"
                >
                  View All Projects
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Center: Navigation */}
      <nav className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-6">
        <Link
          href="/dashboard"
          className={`transition-colors hover:text-black ${
            isActive("/dashboard") ? "text-black font-medium" : "text-gray-500"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard?view=projects"
          className={`transition-colors hover:text-black ${
            pathname.includes("project")
              ? "text-black font-medium"
              : "text-gray-500"
          }`}
        >
          Projects
        </Link>
        <button className="text-gray-500 hover:text-black transition-colors cursor-not-allowed opacity-50">
          Candidates
        </button>
        <Link
          href="/dashboard/policy-chat"
          className={`transition-colors hover:text-black ${
            isActive("/dashboard/policy-chat")
              ? "text-black font-medium"
              : "text-gray-500"
          }`}
        >
          Policy Chat
        </Link>
        <button className="text-gray-500 hover:text-black transition-colors cursor-not-allowed opacity-50">
          Settings
        </button>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-black transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-full py-1 pr-3 pl-1 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
              {user?.email ? user.email[0].toUpperCase() : "U"}
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg py-1">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors text-xs"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
