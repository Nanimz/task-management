import userService from "../service/user.mjs";
import tokenService from "../service/refreshTokens.mjs";

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email, dan password wajib diisi !",
      });
    }

    const user = await userService.register(name, email, password);
    return res
      .status(200)
      .json({ success: true, message: "Registrasi berhasil", data: user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
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
        .json({ success: false, message: "Email dan password harus diisi!" });
    }

    const { accessToken, refreshToken } = await userService.login(
      email,
      password,
    );
    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Terjadi kesalahan pada server",
    });
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token wajib diisi" });
    }
    const data = await tokenService.refresh(refreshToken);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Terjadi kesalahan di server",
    });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token wajib ada" });
    }
    await tokenService.logout(refreshToken);
    return res.status(200).json({ success: true, message: "Logout berhasil" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Terjadi kesalahan di server",
    });
  }
}

export default { register, login, refresh, logout };
