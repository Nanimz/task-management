import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Token sudah kadaluarsa"
        : "Token tidak valid";
    return res.status(401).json({ message });
  }
}

export default { authenticate };
