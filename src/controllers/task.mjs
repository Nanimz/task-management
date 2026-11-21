import taskService from "../service/task.mjs";
import {
  PRIORITIES,
  SORTABLE,
  STATUSES,
  validateTask,
} from "../utils/task.validator.mjs";

async function createTask(req, res) {
  try {
    const err = validateTask(req.body);
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }

    const { title, description, status, priority, due_date } = req.body;
    const task = await taskService.addTask(req.user.id, {
      title: title.trim(),
      description,
      status,
      priority,
      due_date,
    });

    return res
      .status(201)
      .json({ success: true, message: "Task berhasil dibuat", data: task });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Terjadi kesalahan pada server",
    });
  }
}

async function getTasks(req, res) {
  try {
    const { id } = req.user;
    const { title, status, priority, sortBy, order } = req.query;

    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      return res.status(400).json({
        success: false,
        message: "Title harus berupa teks dan tidak boleh kosong",
      });
    }

    if (status !== undefined && !STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status harus berupa salah satu dari: ${STATUSES.join(", ")}`,
      });
    }

    if (priority !== undefined && !PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority harus berupa salah satu dari: ${PRIORITIES.join(", ")}`,
      });
    }

    if (sortBy !== undefined && !SORTABLE.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: `SortBy harus berupa salah satu dari: ${SORTABLE.join(", ")}`,
      });
    }

    if (order !== undefined && !["asc", "desc"].includes(order)) {
      return res.status(400).json({
        success: false,
        message: `Order harus berupa asc atau desc`,
      });
    }

    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    if (!Number.isInteger(page) || page < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Page harus bilangan bulat >= 1" });
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res
        .status(400)
        .json({ success: false, message: "Limit harus bilangan bulat 1-100" });
    }

    const { tasks, total, totalPages } = await taskService.getAllTasks(id, {
      title: title?.trim(),
      status,
      priority,
      sortBy,
      order,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: tasks,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Terjadi kesalahan pada server",
    });
  }
}

async function getTaskById(req, res) {
  try {
    const taskId = Number(req.params.id);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "ID task tidak valid" });
    }
    const data = await taskService.getTaskById(taskId, req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Terjadi kesalahan pada server",
    });
  }
}

async function updateTaskDetail(req, res) {
  try {
    const fields = ["title", "description", "status", "priority", "due_date"];
    if (!fields.some((f) => req.body[f] !== undefined)) {
      return res
        .status(400)
        .json({ success: false, message: "Tidak ada data yang diubah" });
    }

    const err = validateTask(req.body, { partial: true });
    if (err) {
      res.status(400).json({ success: false, message: err });
    }

    const { title, description, status, priority, due_date } = req.body;
    const task = await taskService.updateTask(req.params.id, req.user.id, {
      title: title?.trim(),
      description,
      status,
      priority,
      due_date,
    });

    return res
      .status(201)
      .json({ success: true, message: "Task berhasil diupdate", data: task });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Terjadi kesalahan pada server",
    });
  }
}

async function removeTask(req, res) {
  try {
    const { id: userId } = req.user;
    const taskId = Number(req.params.id);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Task ID tidak valid" });
    }

    const task = await taskService.deleteTask(taskId, userId);
    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Terjadi kesalahan pada server",
    });
  }
}

export default {
  createTask,
  getTasks,
  getTaskById,
  updateTaskDetail,
  removeTask,
};
