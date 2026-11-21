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

async function getTaskById(taskId, userId) {
  const task = await Task.getTaskById(taskId, userId);
  if (!task) {
    const error = new Error("Task tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }
  return task;
}

async function updateTask(taskId, userId, data) {
  const task = await Task.update(taskId, userId, data);
  if (!task) {
    const error = new Error("Task tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }
  return task;
}

async function deleteTask(taskId, userId) {
  const task = await Task.delete(taskId, userId);
  if (!task) {
    const error = new Error("Task tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }
  return task;
}

async function getAllTasks(userId, options) {
  const { tasks, total } = await Task.findAll(userId, options);
  const { limit = 10 } = options;
  return { tasks, totalPages: Math.ceil(total / limit) };
}

export default {
  addTask,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasks,
};
