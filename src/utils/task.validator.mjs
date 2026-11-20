export const STATUSES = ["pending", "in_progress", "completed"];
export const PRIORITIES = ["low", "medium", "high"];

export function validateTask(data, { partial = false } = {}) {
  const { title, status, priority, due_date } = data;

  if (!partial || title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return "Title harus berupa string dan harus diisi";
    }
    if (title.trim().length > 150) {
      return "Title tidak boleh lebih dari 150 karakter";
    }
  }

  if (status !== undefined && !STATUSES.includes(status)) {
    return `Status harus salah satu dari:  ${STATUSES.join(", ")}`;
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    return `Prioritas harus salah satu dari: ${PRIORITIES.join(", ")}`;
  }

  if (!partial || due_date !== undefined) {
    if (due_date === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
      return "Due date wajib diisi dan harus berformat YYYY-MM-DD";
    }
  }
  return null;
}
