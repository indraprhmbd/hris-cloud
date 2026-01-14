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
      fetch(`http://localhost:8000/projects/${id}`)
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
      const res = await fetch("http://localhost:8000/apply", {
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
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          {project.org_id /* TODO: Fetch Org Name, using ID for now */} Careers
        </h1>
        <p className="text-xl text-gray-400">Join the team at {project.name}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">
            Apply for Generic Engineer
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                required
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                required
                type="email"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Upload CV / Resume (PDF)
              </label>
              <input
                required
                type="file"
                accept=".pdf,.txt,.md"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => e.target.files && setCvFile(e.target.files[0])}
              />
              <p className="text-xs text-gray-400 mt-1">
                Our AI will extract text from your PDF automatically.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-transform transform active:scale-95 ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
