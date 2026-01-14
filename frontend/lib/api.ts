import { createBrowserClient } from "@supabase/ssr";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Helper to get headers with Auth
async function getHeaders() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.auth.getSession();
  const headers: any = { "Content-Type": "application/json" };
  if (data.session) {
    headers["Authorization"] = `Bearer ${data.session.access_token}`;
    headers["x-user-id"] = data.session.user.id;
  }
  return headers;
}

export async function createOrganization(name: string) {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/organizations`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create org: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getOrganizations() {
  const headers = await getHeaders();
  delete headers["Content-Type"];
  const res = await fetch(`${API_URL}/organizations`, { headers });
  if (!res.ok) throw new Error("Failed to fetch orgs");
  return res.json();
}

export async function createProject(
  orgId: string,
  name: string,
  templateId: string
) {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify({ org_id: orgId, name, template_id: templateId }),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function getProjects(orgId: string) {
  const headers = await getHeaders();
  delete headers["Content-Type"];
  const res = await fetch(`${API_URL}/projects?org_id=${orgId}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function generateApiKey(projectId: string) {
  const headers = await getHeaders();
  delete headers["Content-Type"];
  const res = await fetch(`${API_URL}/projects/${projectId}/keys`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to generate key");
  return res.json();
}

export async function getProject(projectId: string) {
  const headers = await getHeaders();
  delete headers["Content-Type"];
  const res = await fetch(`${API_URL}/projects/${projectId}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

export async function updateProject(
  projectId: string,
  updates: {
    name?: string;
    description?: string;
    requirements?: string;
    benefits?: string;
  }
) {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

export async function getApplicants(projectId: string) {
  const headers = await getHeaders();
  delete headers["Content-Type"];
  const res = await fetch(`${API_URL}/applicants?project_id=${projectId}`, {
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch applicants");
  return res.json();
}

export async function updateApplicantStatus(
  applicantId: string,
  status: string
) {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/applicants/${applicantId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update applicant");
  return res.json();
}
