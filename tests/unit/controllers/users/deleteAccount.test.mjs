import { jest, describe, test, expect } from "@jest/globals";
import { password } from "pg/lib/defaults";

jest.unstable_mockModule("../../../../src/service/user.mjs", () => ({
  default: {
    deleteUser: jest.fn(),
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

describe("User Controller - Delete User", () => {
  test("should return 400 if user id is missing", async () => {
    const req = mockRequest({
      body: {
        password: "rahasia123",
      },
    });
    const res = mockResponse();

    await userController.deleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Harus menyertakan userId",
    });
    expect(userService.deleteUser).not.toHaveBeenCalled();
  });

  test("should return 400 if password is missing", async () => {
    const req = mockRequest({
      body: {},
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.deleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Password harus diisi",
    });
    expect(userService.deleteUser).not.toHaveBeenCalled();
  });

  test("should return 200 if delete user success", async () => {
    const mockUser = {
      id: 1,
      name: "Nanimz",
      email: "nanimz@example.com",
    };
    userService.deleteUser.mockResolvedValue(mockUser);

    const req = mockRequest({
      body: {
        password: "rahasia123",
      },
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.deleteAccount(req, res);

    expect(userService.deleteUser).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Data user berhasil dihapus",
      data: mockUser,
    });
  });

  test("should return 404 if user is not found", async () => {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    userService.deleteUser.mockRejectedValue(error);

    const req = mockRequest({
      body: {
        password: "rahasia123",
      },
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.deleteAccount(req, res);

    expect(userService.deleteUser).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User tidak ditemukan",
    });
  });

  test("should return 400 if password isn't correct", async () => {
    const error = new Error("Password salah");
    error.statusCode = 400;
    userService.deleteUser.mockRejectedValue(error);

    const req = mockRequest({
      body: {
        password: "rahasiaabc",
      },
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.deleteAccount(req, res);

    expect(userService.deleteUser).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Password salah",
    });
  });
});
