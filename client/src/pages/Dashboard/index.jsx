import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchSummary } from "../../services/stats";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorBanner from "../../components/ErrorBanner";

const LEAVE_COLORS = {
  PENDING: "#f59e0b",
  APPROVED: "#10b981",
  REJECTED: "#f43f5e",
};

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Live overview of employees and leave requests.
      </p>

      <div className="mt-6">
        {loading && <LoadingSpinner label="Loading dashboard..." />}
        {!loading && error && <ErrorBanner message={error} onRetry={load} />}

        {!loading && !error && summary && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Employees" value={summary.totalEmployees} />
              <StatCard label="Active Employees" value={summary.activeEmployees} />
              <StatCard label="Pending Leaves" value={summary.pendingLeaves} />
              <StatCard label="Approved Leaves" value={summary.approvedLeaves} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700">
                  Employees by Department
                </h2>
                <div className="mt-4 h-72">
                  {summary.employeesByDepartment.length === 0 ? (
                    <p className="text-sm text-gray-500">No employees yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={summary.employeesByDepartment}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700">
                  Leave Requests by Status
                </h2>
                <div className="mt-4 h-72">
                  {summary.leavesByStatus.every((s) => s.count === 0) ? (
                    <p className="text-sm text-gray-500">No leave requests yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.leavesByStatus}
                          dataKey="count"
                          nameKey="status"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {summary.leavesByStatus.map((entry) => (
                            <Cell
                              key={entry.status}
                              fill={LEAVE_COLORS[entry.status]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
