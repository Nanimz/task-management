import userService from "../service/user.mjs";

async function getMe(req, res) {
  try {
    const user = await userService.getProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: user,
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

async function updateUserProfile(req, res) {
  try {
    const { name, email } = req.body;
    if (name === undefined && email === undefined) {
      return res.status(400).json({
        success: false,
        message: "Minimal salah satu dari nama atau email harus diisi",
      });
    }
    if (name !== undefined && !String(name).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "name tidak boleh kosong" });
    }
    if (email !== undefined && !String(email).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "email tidak boleh kosong" });
    }

    const user = await userService.updateProfile(req.user.id, name, email);
    return res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Terjadi kesalahan di server",
    });
  }
}

async function updateUserPassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password harus diisi" });
    }

    if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Password harus berupa teks" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Password minimal 8 karakter" });
    }

    await userService.changePassword(req.user.id, oldPassword, newPassword);
    return res
      .status(200)
      .json({ success: true, message: "Password berhasil diperbarui" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Terjadi kesalahan pada server",
    });
  }
}

export default { getMe, updateUserProfile, updateUserPassword };
