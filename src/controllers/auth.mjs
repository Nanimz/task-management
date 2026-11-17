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
    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Terjadi kesalahan pada server",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password harus diisi!" });
    }

    const { accessToken, refreshToken } = await userService.login(
      email,
      password,
    );
    return res
      .status(200)
      .json({ message: "Login berhasil", data: { accessToken, refreshToken } });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Terjadi kesalahan pada server",
    });
  }
}

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

export default { register, login, getMe };
