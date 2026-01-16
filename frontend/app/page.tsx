import Link from "next/link";
import { ArrowRight, Shield, Users, Zap, Layout, Play } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-[10px]">
              H
            </div>
            HARIS
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-black transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-black transition-colors"
            >
              Workflow
            </a>
            <a href="#demo" className="hover:text-black transition-colors">
              Demo
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Agentic HR Redesign 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            <span className="text-black">HARIS:</span> AI-Powered HR for{" "}
            <span className="text-gray-400">Autonomous Governance</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Revolutionizing HR management with Agentic AI. HARIS acts as a
            powerful checker and drafter, empowering HR teams with perfect data
            clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 text-base font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/policy"
              className="px-8 py-3.5 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Employee View
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-20 max-w-5xl mx-auto rounded-xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden bg-gray-50 select-none">
          <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200"></div>
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
            </div>
            <div className="h-6 w-64 bg-gray-50 rounded flex items-center px-3 text-xs text-gray-400 font-mono">
              haris.cloud/dashboard
            </div>
          </div>
          <div className="flex h-[400px]">
            {/* Sidebar Mockup */}
            <div className="w-48 bg-gray-50 border-r border-gray-200 p-4 space-y-4">
              <div className="w-8 h-8 bg-black rounded shrink-0 mb-6"></div>
              <div className="space-y-4">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-3 w-28 bg-gray-200 rounded"></div>
              </div>
            </div>
            {/* Content Mockup */}
            <div className="flex-1 bg-white p-8">
              <div className="flex justify-between mb-8">
                <div className="h-6 w-40 bg-gray-100 rounded"></div>
                <div className="h-8 w-24 bg-black rounded"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 border border-gray-100 rounded-lg flex items-center px-4 justify-between"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-32 bg-gray-200 rounded"></div>
                        <div className="h-2 w-20 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-16 bg-green-50 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-black text-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
            The Philosophy
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold mb-8">
            Checker, Drafter, Not Executor.
          </h3>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            HARIS respects human autonomy. Our AI analyzes data, scores
            candidates, and drafts responses, but final actions always remain
            with you.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold">Smart Recruitment</h4>
            <p className="text-gray-500">
              AI screening with rule-based pre-filtering to ensure only
              qualified talent hits your desk.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold">Policy Knowledge</h4>
            <p className="text-gray-500">
              Transparent AI assistant that explains policies to employees
              without executing sensitive actions.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <Layout className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold">Human Governance</h4>
            <p className="text-gray-500">
              One-click conversion from approved candidate to employee database
              with full audit logging.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-50 border-t border-gray-100 text-center">
        <div className="font-bold text-lg mb-2">HARIS</div>
        <p className="text-sm text-gray-500">
          Autonomous Human Resource Information System
        </p>
      </footer>
    </div>
  );
}
