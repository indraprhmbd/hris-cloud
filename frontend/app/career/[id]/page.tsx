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

  const themes: any = {
    "template-classic": {
      bg: "bg-gray-50",
      card: "bg-white border-gray-100",
      text: "text-gray-900",
      hero: "bg-white text-gray-900 border-b border-gray-200",
      button: "bg-blue-800 hover:bg-blue-900 text-white rounded-lg",
      input: "bg-white border-gray-300",
    },
    "template-modern": {
      bg: "bg-slate-900",
      card: "bg-slate-800 border-slate-700",
      text: "text-white",
      hero: "bg-transparent text-white",
      button: "bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg",
      input: "bg-slate-900 border-slate-600 text-white",
    },
    "template-creative": {
      bg: "bg-[#FFF8F0]",
      card: "bg-white border-orange-100 shadow-[4px_4px_0px_0px_rgba(251,146,60,1)]",
      text: "text-gray-900",
      hero: "bg-orange-400 text-white",
      button: "bg-black hover:bg-gray-800 text-white rounded-full",
      input: "bg-orange-50 border-orange-200",
    },
  };

  const activeTheme = project
    ? themes[project.template_id] || themes["template-classic"]
    : themes["template-classic"];

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
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-lg">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Application Received!
          </h2>
          <p className="text-gray-600">
            Our AI Agent is reviewing your profile right now.
          </p>
        </div>
      </div>
    );
  }

  if (!project)
    return <div className="p-10 text-center">Loading Job Board...</div>;

  return (
    <div
      className={`min-h-screen font-sans transition-colors ${activeTheme.bg} ${activeTheme.text}`}
    >
      {/* Hero */}
      <div className={`py-20 px-4 text-center ${activeTheme.hero}`}>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          {project.name}
        </h1>
        <p className="text-xl opacity-80">
          Join the team at {project.org_name || "us"}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div
          className={`p-8 shadow-2xl border ${activeTheme.card} transition-all`}
        >
          <h2 className="text-2xl font-bold mb-6">Apply for {project.name}</h2>

          {/* Dynamic Content Section */}
          {(project.description ||
            project.requirements ||
            project.benefits) && (
            <div
              className={`mb-8 p-6 rounded-xl ${
                activeTheme.bg === "bg-slate-900"
                  ? "bg-slate-700/50"
                  : "bg-gray-50"
              }`}
            >
              {project.description && (
                <div className="mb-4">
                  <h3 className={`font-bold text-lg mb-2 ${activeTheme.text}`}>
                    About the Role
                  </h3>
                  <p
                    className={`whitespace-pre-wrap opacity-90 ${activeTheme.text}`}
                  >
                    {project.description}
                  </p>
                </div>
              )}

              {project.requirements && (
                <div className="mb-4">
                  <h3 className={`font-bold text-lg mb-2 ${activeTheme.text}`}>
                    Requirements
                  </h3>
                  <p
                    className={`whitespace-pre-wrap opacity-90 ${activeTheme.text}`}
                  >
                    {project.requirements}
                  </p>
                </div>
              )}

              {project.benefits && (
                <div>
                  <h3 className={`font-bold text-lg mb-2 ${activeTheme.text}`}>
                    Benefits
                  </h3>
                  <p
                    className={`whitespace-pre-wrap opacity-90 ${activeTheme.text}`}
                  >
                    {project.benefits}
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className={`block text-sm font-semibold mb-1 opacity-80 ${activeTheme.text}`}
              >
                Full Name
              </label>
              <input
                required
                className={`w-full p-3 border focus:ring-2 focus:ring-blue-500 outline-none transition ${activeTheme.input}`}
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-semibold mb-1 opacity-80 ${activeTheme.text}`}
              >
                Email Address
              </label>
              <input
                required
                type="email"
                className={`w-full p-3 border focus:ring-2 focus:ring-blue-500 outline-none transition ${activeTheme.input}`}
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-semibold mb-1 opacity-80 ${activeTheme.text}`}
              >
                Upload CV / Resume (PDF)
              </label>
              <input
                required
                type="file"
                accept=".pdf,.txt,.md"
                className={`w-full p-3 border focus:ring-2 focus:ring-blue-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 ${activeTheme.input}`}
                onChange={(e) => e.target.files && setCvFile(e.target.files[0])}
              />
              <p className="text-xs text-gray-400 mt-1">
                Our AI will extract text from your PDF automatically.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg font-bold shadow-lg transition-transform transform active:scale-95 ${
                activeTheme.button
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
