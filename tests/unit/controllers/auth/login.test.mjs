import { jest, describe, test, expect } from "@jest/globals";

jest.unstable_mockModule("../../../../src/service/user.mjs", () => ({
  default: {
    login: jest.fn(),
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

describe("Authentication - Login", () => {
  test("should return 400 if email is missing", async () => {
    const req = mockRequest({
      password: "password123",
    });

    const res = mockResponse();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email dan password harus diisi!",
    });
    expect(userService.login).not.toHaveBeenCalled();
  });

  test("should return 400 if password is missing", async () => {
    const req = mockRequest({
      email: "nanimz@example.com",
    });

    const res = mockResponse();

    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email dan password harus diisi!",
    });
    expect(userService.login).not.toHaveBeenCalled();
  });

  test("should return 200 and tokens if login is successfull", async () => {
    userService.login.mockResolvedValue({
      accessToken: "access-token-xyz",
      refreshToken: "refresh-token-123",
    });

    const req = mockRequest({
      email: "nanimz@example.com",
      password: "password123",
    });

    const res = mockResponse();

    await authController.login(req, res);

    expect(userService.login).toHaveBeenCalledWith(
      "nanimz@example.com",
      "password123",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Login berhasil",
      data: {
        accessToken: "access-token-xyz",
        refreshToken: "refresh-token-123",
      },
    });
  });

  test("should return 401 if credentials are invalid", async () => {
    const error = new Error("Email atau password salah");
    error.statusCode = 401;
    userService.login.mockRejectedValue(error);

    const req = mockRequest({
      email: "nanimz@gmail.com",
      password: "password321",
    });

    const res = mockResponse();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email atau password salah",
    });
  });

  test("should return 500 if unexpected server error occurs", async () => {
    userService.login.mockRejectedValue(new Error("Connection failed"));

    const req = mockRequest({
      email: "nanimz@example.com",
      password: "password123",
    });

    const res = mockResponse();

    await authController.login(req, res);

    expect(userService.login).toHaveBeenCalledWith(
      "nanimz@example.com",
      "password123",
    );
    expect(userService.login).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Terjadi kesalahan pada server",
    });
  });
});
