import userService from "../service/user.mjs";
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

export default { updateUserProfile };
