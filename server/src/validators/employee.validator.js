const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

const statusEnum = z.enum(["ACTIVE", "INACTIVE"]);

const dateString = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date")
  .transform((val) => new Date(val));

const phoneField = z.string().trim().max(30);

const createEmployeeBody = z.object({
  employeeCode: z.string().trim().min(1, "employeeCode is required").max(50),
  name: z.string().trim().min(1, "name is required").max(120),
  email: z.string().trim().min(1, "email is required").email("Invalid email").max(150),
  phone: phoneField.optional().default(""),
  department: z.string().trim().min(1, "department is required").max(80),
  designation: z.string().trim().min(1, "designation is required").max(80),
  joiningDate: dateString,
  status: statusEnum.optional().default("ACTIVE"),
});

// Built separately (not `.partial()` on createEmployeeBody): that schema's
// `.default()`s would still fill in omitted fields (e.g. phone -> "",
// status -> "ACTIVE") and silently overwrite existing values on update.
const updateEmployeeBody = z.object({
  employeeCode: z.string().trim().min(1, "employeeCode is required").max(50).optional(),
  name: z.string().trim().min(1, "name is required").max(120).optional(),
  email: z
    .string()
    .trim()
    .min(1, "email is required")
    .email("Invalid email")
    .max(150)
    .optional(),
  phone: phoneField.optional(),
  department: z.string().trim().min(1, "department is required").max(80).optional(),
  designation: z.string().trim().min(1, "designation is required").max(80).optional(),
  joiningDate: dateString.optional(),
  status: statusEnum.optional(),
});

const employeeIdParams = z.object({
  id: objectId,
});

const listEmployeesQuery = z.object({
  search: z.string().trim().max(150).optional(),
  department: z.string().trim().max(80).optional(),
  status: statusEnum.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

module.exports = {
  createEmployeeBody,
  updateEmployeeBody,
  employeeIdParams,
  listEmployeesQuery,
};
