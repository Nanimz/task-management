import { jest, describe, test, expect } from "@jest/globals";

jest.unstable_mockModule("../../../../src/service/user.mjs", () => ({
  default: {
    changePassword: jest.fn(),
  },
}));

const { default: userService } =
  await import("../../../../src/service/user.mjs");
const { default: userController } =
  await import("../../../../src/controllers/user.mjs");

function mockRequest({ body = {}, user = {} } = {}) {
  return { body, user };
}

function mockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("User Controller - Change Password", () => {
  test("should return 400 if oldPassword is missing", async () => {
    const req = mockRequest({
      body: {
        newPassword: "rahasia321",
      },
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.updateUserPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Password harus diisi",
    });
    expect(userService.changePassword).not.toHaveBeenCalled();
  });

  test("should return 400 if newPassword is missing", async () => {
    const req = mockRequest({
      body: {
        oldPassword: "rahasia123",
      },
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.updateUserPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Password harus diisi",
    });
    expect(userService.changePassword).not.toHaveBeenCalled();
  });

  test("should return 400 if oldPassword isn't string", async () => {
    const req = mockRequest({
      body: {
        oldPassword: 123,
        newPassword: "rahasia321",
      },
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.updateUserPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Password harus berupa teks",
    });
    expect(userService.changePassword).not.toHaveBeenCalled();
  });

  test("should return 400 if newPassword isn't string", async () => {
    const req = mockRequest({
      body: {
        oldPassword: "rahasia123",
        newPassword: 321,
      },
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.updateUserPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Password harus berupa teks",
    });
    expect(userService.changePassword).not.toHaveBeenCalled();
  });

  test("should return 400 if new password length less than 8", async () => {
    const req = mockRequest({
      body: {
        oldPassword: "rahasia123",
        newPassword: "abc",
      },
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.updateUserPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Password minimal 8 karakter",
    });
    expect(userService.changePassword).not.toHaveBeenCalled();
  });

  test("should return 200 if change password user success", async () => {
    const req = mockRequest({
      body: {
        oldPassword: "rahasia123",
        newPassword: "rahasia321",
      },
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.updateUserPassword(req, res);

    expect(userService.changePassword).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Password berhasil diperbarui",
    });
  });

  test("should return 404 if user is not found", async () => {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    userService.changePassword.mockRejectedValue(error);

    const req = mockRequest({
      body: {
        oldPassword: "rahasia123",
        newPassword: "rahasia321",
      },
      user: {
        id: 2,
      },
    });
    const res = mockResponse();

    await userController.updateUserPassword(req, res);

    expect(userService.changePassword).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User tidak ditemukan",
    });
  });

  test("should return 500 if server error occurs", async () => {
    userService.changePassword.mockRejectedValue(
      new Error("Connection failed"),
    );

    const req = mockRequest({
      body: {
        oldPassword: "rahasia123",
        newPassword: "rahasia321",
      },
      user: {
        id: 2,
      },
    });
    const res = mockResponse();

    await userController.updateUserPassword(req, res);

    expect(userService.changePassword).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  });
});
