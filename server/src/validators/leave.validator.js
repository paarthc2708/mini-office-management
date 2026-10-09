const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

const leaveTypeEnum = z.enum(["casual", "sick", "annual"]);
const leaveStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

const dateString = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date")
  .transform((val) => new Date(val));

const createLeaveBody = z
  .object({
    employeeId: objectId,
    leaveType: leaveTypeEnum,
    startDate: dateString,
    endDate: dateString,
    reason: z.string().trim().min(1, "reason is required").max(500),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "startDate must not be after endDate",
    path: ["startDate"],
  });

const updateLeaveStatusBody = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    message: "status must be APPROVED or REJECTED",
  }),
  reviewedBy: z.string().trim().max(120).optional(),
});

const leaveIdParams = z.object({
  id: objectId,
});

const listLeavesQuery = z.object({
  status: leaveStatusEnum.optional(),
  employeeId: objectId.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

module.exports = {
  createLeaveBody,
  updateLeaveStatusBody,
  leaveIdParams,
  listLeavesQuery,
};
