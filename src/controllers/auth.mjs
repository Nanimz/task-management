import userService from "../service/user.mjs";

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, dan password wajib diisi !" });
    }

    const user = await userService.register(name, email, password);
    return res.status(200).json({ message: "Registrasi berhasil", data: user });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        message: error.statusCode
          ? error.message
          : "Terjadi kesalahan pada server",
      });
  }
}
