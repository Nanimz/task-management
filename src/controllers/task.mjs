import taskService from "../service/task.mjs";

const STATUSES = ["pending", "in_progress", "completed"];
const PRIORITIES = ["low", "medium", "high"];

async function createTask(req, res) {
  try {
    const { title, description, status, priority, due_date } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title harus berupa string dan harus diisi",
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Title tidak boleh lebih dari 150 karakter",
      });
    }

    if (status !== undefined && !STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status harus salah satu dari:  ${STATUSES.join(", ")}`,
      });
    }

    if (priority !== undefined && !PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Prioritas harus salah satu dari: ${PRIORITIES.join(", ")}`,
      });
    }

    if (due_date === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
      return res.status(400).json({
        success: false,
        message: "Due date wajib diisi dan harus berformat YYYY-MM-DD",
      });
    }

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
    const tasks = await taskService.getAllTasks(id);
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
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

export default { createTask, getTasks, getTaskById };
