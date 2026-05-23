import { format } from "date-fns";

export function formatVietnamDate(date: Date | string) {
  const raw = typeof date === "string" ? date : date.toISOString();
  const day = raw.slice(0, 10);
  return format(new Date(`${day}T00:00:00.000Z`), "dd/MM/yyyy");
}

export function formatDateInput(date: Date | string) {
  const raw = typeof date === "string" ? date : date.toISOString();
  return raw.slice(0, 10);
}
