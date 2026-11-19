import Task from "../models/task.mjs";

async function addTask(userId, data) {
  if (
    data.due_date &&
    new Date(data.due_date) < new Date().setHours(0, 0, 0, 0)
  ) {
    const error = new Error("Deadline tidak boleh di masa lalu");
    error.statusCode = 400;
    throw error;
  }
  const task = await Task.create(userId, data);
  return task;
}

async function getTasks(userId) {
  const tasks = await Task.getAllByUserId(userId);
  return tasks;
}

export default { addTask, getTasks };
