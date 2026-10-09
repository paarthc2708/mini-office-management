import { useEffect, useState } from "react";

const EMPTY_FORM = {
  employeeCode: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
  status: "ACTIVE",
};

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function EmployeeFormModal({ open, employee, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setForm(
        employee
          ? {
              employeeCode: employee.employeeCode,
              name: employee.name,
              email: employee.email,
              phone: employee.phone || "",
              department: employee.department,
              designation: employee.designation,
              joiningDate: toDateInputValue(employee.joiningDate),
              status: employee.status,
            }
          : EMPTY_FORM
      );
    }
  }, [open, employee]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || "Failed to save employee");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          {employee ? "Edit Employee" : "Add Employee"}
        </h2>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Employee Code">
              <input
                name="employeeCode"
                value={form.employeeCode}
                onChange={handleChange}
                required
                maxLength={50}
                className="input"
              />
            </Field>
            <Field label="Status">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="input"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </Field>
            <Field label="Full Name" className="sm:col-span-2">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={120}
                className="input"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={150}
                className="input"
              />
            </Field>
            <Field label="Phone">
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={30}
                className="input"
              />
            </Field>
            <Field label="Department">
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                maxLength={80}
                className="input"
              />
            </Field>
            <Field label="Designation">
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                required
                maxLength={80}
                className="input"
              />
            </Field>
            <Field label="Joining Date" className="sm:col-span-2">
              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                required
                className="input"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
