"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    getUser();
  }, []);

  // Auto-expand Recruitment if on any recruitment sub-page
  useEffect(() => {
    if (pathname.includes("/dashboard/recruitment")) {
      setIsRecruitmentOpen(true);
    }
  }, [pathname]);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const isRecruitmentActive = () => {
    return (
      pathname.includes("/dashboard/recruitment") || pathname === "/dashboard"
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      {/* Brand */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <div>
            <span className="font-bold text-gray-900 tracking-tight block">
              HARIS
            </span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">
              AI-Assisted HR
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">
          Core HR
        </p>

        {/* Recruitment with Sub-Menu */}
        <div>
          <button
            onClick={() => setIsRecruitmentOpen(!isRecruitmentOpen)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isRecruitmentActive()
                ? "bg-black text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50 hover:text-black"
            }`}
          >
            <div className="flex items-center gap-3">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Recruitment</span>
            </div>
            {isRecruitmentOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Sub-Navigation */}
          {isRecruitmentOpen && (
            <div className="ml-7 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
              <Link
                href="/dashboard/recruitment/projects"
                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pathname === "/dashboard/recruitment/projects"
                    ? "bg-gray-100 text-black"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                }`}
              >
                Projects
              </Link>
              <Link
                href="/dashboard/recruitment/inbox"
                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pathname === "/dashboard/recruitment/inbox"
                    ? "bg-gray-100 text-black"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                }`}
              >
                CV Inbox
              </Link>
              <Link
                href="/dashboard/recruitment/interview"
                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pathname === "/dashboard/recruitment/interview"
                    ? "bg-gray-100 text-black"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                }`}
              >
                Interview
              </Link>
              <Link
                href="/dashboard/recruitment/verification"
                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pathname === "/dashboard/recruitment/verification"
                    ? "bg-gray-100 text-black"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                }`}
              >
                Verification
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/employees"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            isActive("/dashboard/employees")
              ? "bg-black text-white shadow-md"
              : "text-gray-500 hover:bg-gray-50 hover:text-black"
          }`}
        >
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Employee Data
        </Link>

        <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">
          Knowledge
        </p>

        <Link
          href="/dashboard/policy"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            isActive("/dashboard/policy")
              ? "bg-black text-white shadow-md"
              : "text-gray-500 hover:bg-gray-50 hover:text-black"
          }`}
        >
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          Policy Mgmt
        </Link>
      </nav>

      {/* Footer: User Profile */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
            {user?.email ? user.email[0].toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.email?.split("@")[0]}
            </p>
            <p className="text-[10px] text-gray-500 truncate">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
