"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CareerPage() {
  const { id } = useParams(); // project id
  const [project, setProject] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      fetch(`${API_URL}/projects/${id}`)
        .then((res) => res.json())
        .then((data) => setProject(data))
        .catch((err) => console.error("Failed to load project", err));
    }
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cvFile) {
      alert("Please upload a CV");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("cv", cvFile);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_URL}/apply`, {
        method: "POST",
        headers: {
          "x-project-id": id as string,
        },
        body: formData,
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        alert("Application failed: " + JSON.stringify(err));
      }
    } catch (err: any) {
      console.error(err);
      alert("Error submitting: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-100 max-w-lg w-full mx-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Received
          </h2>
          <p className="text-gray-500 mb-8">
            Our AI Agent is reviewing your profile right now. You will receive
            an email shortly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-500 hover:text-black font-medium underline"
          >
            Submit another application
          </button>
        </div>
      </div>
    );
  }

  if (!project)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm font-mono animate-pulse">
        Loading Job Board...
      </div>
    );

  // Check if project is inactive
  if (project.is_active === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
        <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200 max-w-lg w-full">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Position Closed
          </h2>
          <p className="text-gray-600 mb-6">
            This position is currently not accepting new applications.
          </p>
          <p className="text-sm text-gray-500">
            Thank you for your interest in{" "}
            {project.org_name || "our organization"}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-900 selection:bg-gray-200">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tight flex items-center gap-2">
            <div className="w-5 h-5 bg-black rounded-sm"></div>
            {project.org_name || "HRIS Cloud"}
          </div>
          <a
            href="#"
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            Open Roles
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 md:p-12 border-b border-gray-100">
            <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide mb-4">
              Full Time
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
              {project.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
              Join the team at {project.org_name || "us"} and help build the
              future.
            </p>
          </div>

          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Left Column: Details */}
            <div className="md:col-span-2 p-8 md:p-12 space-y-12">
              {project.description ||
              project.requirements ||
              project.benefits ? (
                <>
                  {project.description && (
                    <section>
                      <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                        About the Role
                      </h3>
                      <div className="prose prose-gray prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {project.description}
                      </div>
                    </section>
                  )}

                  {project.requirements && (
                    <section>
                      <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                        Requirements
                      </h3>
                      <div className="prose prose-gray prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {project.requirements}
                      </div>
                    </section>
                  )}

                  {project.benefits && (
                    <section>
                      <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                        Benefits
                      </h3>
                      <div className="prose prose-gray prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {project.benefits}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <div className="text-gray-400 italic text-center py-12">
                  No job details provided.
                </div>
              )}
            </div>

            {/* Right Column: Application Form */}
            <div className="bg-gray-50/50 p-8 md:p-12">
              <div className="sticky top-24">
                <h3 className="font-bold text-gray-900 text-xl mb-6">
                  Apply Now
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-300"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-300"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Resume / CV <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="file"
                        accept=".pdf"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer text-gray-500"
                        onChange={(e) =>
                          e.target.files && setCvFile(e.target.files[0])
                        }
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      AI-powered resume parsing enabled
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 bg-black text-white text-sm font-bold rounded-lg shadow-sm hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                  <p className="text-[10px] text-center text-gray-400">
                    By applying, you agree to our{" "}
                    <a href="#" className="underline hover:text-gray-600">
                      Privacy Policy
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {project.org_name || "HRIS Cloud Inc"}. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
