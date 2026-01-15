import Link from "next/link";
import {
  ArrowRight,
  Check,
  Shield,
  Users,
  Zap,
  Layout,
  Play,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="w-5 h-5 bg-black rounded-sm" />
            HRIS Cloud
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
            Re:AI Hackathon 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            AI-Powered HR Systems for{" "}
            <span className="text-gray-500">Modern Organizations</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Build recruitment workflows powered by agentic AI, designed to
            support and augment human decision-making. Trusted by
            forward-thinking teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 text-base font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
            >
              Create Your HR System <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="px-8 py-3.5 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
              <Play className="w-4 h-4 fill-gray-700" /> View Demo
            </button>
          </div>
        </div>

        {/* Hero Visual - Code-based Dashboard Mockup */}
        <div className="mt-20 max-w-5xl mx-auto rounded-xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden bg-gray-50 select-none">
          <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200"></div>
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
            </div>
            <div className="h-6 w-64 bg-gray-50 rounded flex items-center px-3 text-xs text-gray-400 font-mono">
              hris.cloud/dashboard/priority
            </div>
          </div>
          <div className="flex h-[400px]">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-4">
              <div className="space-y-1">
                {["Overview", "Applicants", "Interviews", "Settings"].map(
                  (item) => (
                    <div
                      key={item}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        item === "Applicants"
                          ? "bg-white shadow-sm text-black"
                          : "text-gray-500"
                      }`}
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Active Jobs
                </div>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>{" "}
                  Frontend Eng
                </div>
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 bg-white p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-gray-900">
                  Priority Inbox
                </h3>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                    AI Score &gt; 80
                  </div>
                  <div className="px-3 py-1 bg-black text-white rounded text-xs font-medium">
                    Export
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: "Sarah Chen",
                    role: "Senior Frontend",
                    score: 92,
                    status: "Analyzed",
                  },
                  {
                    name: "Michael Ross",
                    role: "Product Designer",
                    score: 88,
                    status: "Analyzed",
                  },
                  {
                    name: "David Kim",
                    role: "Backend Engineer",
                    score: 85,
                    status: "Analyzed",
                  },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500">{c.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-bold text-gray-900">
                          {c.score}/100
                        </div>
                        <div className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Excellent Match
                        </div>
                      </div>
                      <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${c.score}%` }}
                        ></div>
                      </div>
                      <button className="px-3 py-1.5 border border-gray-200 rounded text-xs font-medium hover:bg-gray-50">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
            The Problem
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Hiring Is Broken
          </h3>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            HR teams are overwhelmed by hundreds of applications, manual CV
            screening, and outdated applicant tracking systems. Most HR software
            stores data but does not help HR make decisions.
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">
            The Solution
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            HR Systems That Think and Act
          </h3>
          <div className="w-16 h-1 bg-gray-200 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            HRIS Cloud is not just a database. It is a platform that runs AI
            agents inside your recruitment workflow.
          </p>
        </div>

        {/* Core Features Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Agentic AI",
              desc: "AI that reads CVs, scores candidates, sends emails, and updates the system automatically.",
            },
            {
              icon: Users,
              title: "Human in the Loop",
              desc: "All AI decisions are transparent and require HR approval. You stay in control.",
            },
            {
              icon: Layout,
              title: "Project-Based Hiring",
              desc: "Each hiring need runs as its own isolated AI-powered recruitment system.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                <f.icon className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {f.title}
              </h4>
              <p className="text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-black text-white" id="how-it-works">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold mb-16 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-gray-800 -z-0"></div>

            {[
              {
                step: "01",
                title: "Create Project",
                desc: "Define role limits and requirements.",
              },
              {
                step: "02",
                title: "Connect Page",
                desc: "Launch your custom career site instantly.",
              },
              {
                step: "03",
                title: "AI Analysis",
                desc: "Agents screen and score every applicant.",
              },
              {
                step: "04",
                title: "Review & Hire",
                desc: "Approve top talent with one click.",
              },
            ].map((s, i) => (
              <div key={i} className="relative z-10">
                <div className="w-12 h-12 bg-gray-900 border-2 border-gray-800 rounded-full flex items-center justify-center font-bold text-sm mb-6 mx-auto md:mx-0">
                  {s.step}
                </div>
                <h4 className="text-xl font-bold mb-2 text-center md:text-left">
                  {s.title}
                </h4>
                <p className="text-gray-400 text-sm text-center md:text-left">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">
              Designed for Responsible AI
            </h3>
            <p className="text-gray-600 text-lg">
              We prioritize fairness and transparency in every algorithm we
              build.
            </p>
            <ul className="space-y-4">
              {[
                "Blind screening mode to reduce cognitive bias",
                "Explainable AI reasoning for every score",
                "Human approval required for significant actions",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700">
                  <Shield className="w-5 h-5 text-green-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-gray-50 p-8 rounded-2xl border border-gray-200">
            <div className="space-y-4 font-mono text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                System Status: Operational
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded">
                <span className="text-blue-600">AI_Reasoning:</span>{" "}
                &quot;Candidate demonstrates strong proficiency in React and
                System Design patterns. Recommended for technical
                interview.&quot;
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded opacity-75">
                <span className="text-purple-600">Bias_Check:</span> Personal
                identifiers masked. Scoring based solely on skill keywords.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Start Building Your <br /> AI-Powered HR System
        </h2>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
        >
          Create Your HR System <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 bg-gray-50 text-center">
        <div className="text-sm font-semibold text-gray-900 mb-2">
          HRIS Cloud
        </div>
        <p className="text-gray-500 text-sm">Built for Re:AI Hackathon 2026</p>
      </footer>
    </div>
  );
}
