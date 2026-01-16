"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    leave_remaining: 12,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const res = await fetch(`${API_URL}/employees/`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const res = await fetch(`${API_URL}/employees/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          name: "",
          email: "",
          role: "",
          department: "",
          leave_remaining: 12,
        });
        fetchEmployees();
      } else {
        const error = await res.json();
        alert("Failed to create employee: " + error.detail);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Start Offboarding for this employee?")) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      await fetch(`${API_URL}/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Data</h1>
          <p className="text-gray-500">
            Manage your workforce (Manual HR Operations)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + Add Employee
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 font-medium text-gray-900 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4 text-center">Leave Balance</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  Loading data...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  No employees found. Add one manually.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{emp.name}</span>
                      <span className="text-xs text-gray-400 font-normal">
                        {emp.email}
                      </span>
                      <span className="text-[10px] text-gray-300 font-mono select-all">
                        ID: {emp.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{emp.role}</td>
                  <td className="px-6 py-4">{emp.department || "-"}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        emp.leave_remaining > 5
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {emp.leave_remaining} Days
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-600 hover:text-red-900 text-xs font-medium"
                    >
                      Offboard
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Add New Employee</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Full Name
                </label>
                <input
                  className="w-full border border-gray-200 rounded p-2 text-sm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Email
                </label>
                <input
                  className="w-full border border-gray-200 rounded p-2 text-sm"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Role
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded p-2 text-sm"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Department
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded p-2 text-sm"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Initial Leave Balance
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded p-2 text-sm"
                  value={formData.leave_remaining}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leave_remaining: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-500 hover:text-black text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
