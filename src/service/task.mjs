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

async function getAllTasks(userId) {
  const tasks = await Task.getAllByUserId(userId);
  return tasks;
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

async function searchTasks(userId, title) {
  const tasks = await Task.search(userId, title);
  return tasks;
}

async function tasksFilteredStatus(userId, status) {
  const tasks = await Task.filterByStatus(userId, status);
  return tasks;
}

async function tasksFilteredPriority(userId, priority) {
  const tasks = await Task.filterByPriority(userId, priority);
  return tasks;
}

async function sortUserTasks(userId, sort, order) {
  const tasks = await Task.sortTasks(userId, sort, order);
  return tasks;
}

async function getAllTask(userId, options) {
  const { tasks, total } = await Task.findAll(userId, options);
  const { limit = 10 } = options;
  return { tasks, totalPages: Math.ceil(total / limit) };
}

export default {
  addTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  searchTasks,
  tasksFilteredStatus,
  tasksFilteredPriority,
  sortUserTasks,
  getAllTask,
};
