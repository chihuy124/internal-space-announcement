import { z } from "zod";

const requiredText = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} là bắt buộc`)
    .max(200, `${field} tối đa 200 ký tự`);

export const featureSchema = z.object({
  ticket: z
    .string()
    .trim()
    .min(1, "Link Jira là bắt buộc")
    .max(500, "Link Jira tối đa 500 ký tự")
    .url("Vui lòng nhập link Jira hợp lệ, bắt đầu bằng https://"),
  ticketName: requiredText("Tên ticket"),
  assignee: requiredText("Người thực hiện"),
  releaseDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày release không hợp lệ"),
  userGuide: z
    .string()
    .trim()
    .min(1, "User guide là bắt buộc")
    .max(20000, "User guide tối đa 20.000 ký tự"),
});

export type FeatureFormValues = z.infer<typeof featureSchema>;

export const memberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên thành viên là bắt buộc")
    .max(120, "Tên thành viên tối đa 120 ký tự"),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export function parseReleaseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function toDateInputValue(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function todayDateInputValue() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
