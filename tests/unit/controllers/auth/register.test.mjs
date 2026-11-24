import { jest, describe, test, expect } from "@jest/globals";

jest.unstable_mockModule("../../../../src/service/user.mjs", () => ({
  default: {
    register: jest.fn(),
  },
}));

const { default: userService } =
  await import("../../../../src/service/user.mjs");
const { default: authController } =
  await import("../../../../src/controllers/auth.mjs");

function mockRequest(body = {}) {
  return { body };
}

function mockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("Authentication - Register", () => {
  test("should return 400 if name is missing", async () => {
    const req = mockRequest({
      email: "nanimz@example.com",
      password: "password123",
    });

    const res = mockResponse();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "name, email, dan password wajib diisi !",
    });
    expect(userService.register).not.toHaveBeenCalled();
  });

  test("should return 400 if email is missing", async () => {
    const req = mockRequest({
      name: "Nanimz",
      password: "password123",
    });

    const res = mockResponse();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "name, email, dan password wajib diisi !",
    });
    expect(userService.register).not.toHaveBeenCalled();
  });

  test("should return 400 if password is missing", async () => {
    const req = mockRequest({
      name: "Nanimz",
      email: "nanimz@example.com",
    });

    const res = mockResponse();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "name, email, dan password wajib diisi !",
    });
    expect(userService.register).not.toHaveBeenCalled();
  });

  test("should register user successfully", async () => {
    const req = mockRequest({
      name: "Nanimz",
      email: "nanimz@example.com",
      password: "password123",
    });

    const res = mockResponse();

    const mockUser = {
      id: 1,
      name: "Nanimz",
      email: "nanimz@example.com",
    };

    userService.register.mockResolvedValue(mockUser);

    await authController.register(req, res);

    expect(userService.register).toHaveBeenCalledWith(
      "Nanimz",
      "nanimz@example.com",
      "password123",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Registrasi berhasil",
      data: mockUser,
    });
  });

  test("should return 409 if email already exists", async () => {
    const req = mockRequest({
      name: "Nanimz",
      email: "nanimz@example.com",
      password: "password123",
    });

    const res = mockResponse();

    const error = new Error("Email sudah terdaftar");
    error.statusCode = 409;

    userService.register.mockRejectedValue(error);

    await authController.register(req, res);

    expect(userService.register).toHaveBeenCalledWith(
      "Nanimz",
      "nanimz@example.com",
      "password123",
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email sudah terdaftar",
    });
  });

  test("should return 500 if server error occurs", async () => {
    const req = mockRequest({
      name: "Nanimz",
      email: "nanimz@example.com",
      password: "password123",
    });

    const res = mockResponse();

    userService.register.mockRejectedValue(
      new Error("Database connection failed"),
    );

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Terjadi kesalahan pada server",
    });
  });
});
