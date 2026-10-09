import { useEffect, useState } from "react";
import { createLeave, fetchLeaves, updateLeaveStatus } from "../../services/leaves";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import LeaveFormModal from "../../components/LeaveFormModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ErrorBanner from "../../components/ErrorBanner";

const PAGE_SIZE = 10;
const TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

export default function Leaves() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null); // { leave, action }
  const [reviewing, setReviewing] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLeaves({
        status: tab || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  async function handleCreate(values) {
    await createLeave(values);
    setSuccessMessage("Leave request submitted.");
    setFormOpen(false);
    await load();
  }

  async function handleReviewConfirm() {
    if (!reviewTarget) return;
    setReviewing(true);
    try {
      await updateLeaveStatus(reviewTarget.leave._id, {
        status: reviewTarget.action,
      });
      setSuccessMessage(
        reviewTarget.action === "APPROVED" ? "Leave approved." : "Leave rejected."
      );
      setReviewTarget(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leave Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review employee leave requests and track their status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          + Submit Request
        </button>
      </div>

      {successMessage && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setTab(t.value);
              setPage(1);
            }}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t.value
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading && <LoadingSpinner label="Loading leave requests..." />}

        {!loading && error && (
          <div className="p-4">
            <ErrorBanner message={error} onRetry={load} />
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            title="No leave requests found"
            description="Submit a new leave request to get started."
          />
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      <div className="font-medium">
                        {leave.employee?.name || "Deleted employee"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {leave.employee?.employeeCode}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-700">
                      {leave.leaveType}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(leave.startDate)} &rarr; {formatDate(leave.endDate)}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-700">
                      {leave.reason}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {leave.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setReviewTarget({ leave, action: "APPROVED" })
                            }
                            className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReviewTarget({ leave, action: "REJECTED" })
                            }
                            className="rounded-md px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {leave.reviewedAt ? formatDate(leave.reviewedAt) : "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={setPage}
          />
        )}
      </div>

      <LeaveFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        open={!!reviewTarget}
        title={
          reviewTarget?.action === "APPROVED"
            ? "Approve leave request?"
            : "Reject leave request?"
        }
        description={
          reviewTarget
            ? `This will mark ${reviewTarget.leave.employee?.name || "this employee"}'s request as ${reviewTarget.action.toLowerCase()}.`
            : ""
        }
        confirmLabel={reviewTarget?.action === "APPROVED" ? "Approve" : "Reject"}
        tone={reviewTarget?.action === "APPROVED" ? "primary" : "danger"}
        busy={reviewing}
        onConfirm={handleReviewConfirm}
        onCancel={() => setReviewTarget(null)}
      />
    </div>
  );
}
