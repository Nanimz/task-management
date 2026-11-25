import { jest, describe, test, expect } from "@jest/globals";

jest.unstable_mockModule("../../../../src/service/user.mjs", () => ({
  default: {
    updateProfile: jest.fn(),
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

describe("User Controller - Update Profile", () => {
  test("should return 400 if name is missing", async () => {
    const req = mockRequest({
      email: "nanimz@example.com",
    });
    const res = mockResponse();

    await userController.updateUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Minimal salah satu dari nama atau email harus diisi",
    });
    expect(userService.updateProfile).not.toHaveBeenCalled();
  });

  test("should return 400 if email is missing", async () => {
    const req = mockRequest({
      name: "Nanimz",
    });
    const res = mockResponse();

    await userController.updateUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Minimal salah satu dari nama atau email harus diisi",
    });
    expect(userService.updateProfile).not.toHaveBeenCalled();
  });

  test("should return 400 if name value is empty", async () => {
    const req = mockRequest({
      body: {
        name: "",
        email: "nanimz@example.com",
      },
      user: {
        id: 1,
      },
    });

    const res = mockResponse();

    await userController.updateUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "name tidak boleh kosong",
    });
    expect(userService.updateProfile).not.toHaveBeenCalled();
  });

  test("should return 400 if email value is empty", async () => {
    const req = mockRequest({
      body: {
        name: "Nanimz",
        email: "",
      },
      user: {
        id: 1,
      },
    });

    const res = mockResponse();

    await userController.updateUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "email tidak boleh kosong",
    });
    expect(userService.updateProfile).not.toHaveBeenCalled();
  });

  test("should return 200 update profile success", async () => {
    const mockUser = {
      name: "Nanimz",
      email: "nanimz@example.com",
    };
    userService.updateProfile.mockResolvedValue(mockUser);

    const req = mockRequest({
      body: {
        name: "Nanimz",
        email: "nanimz@example.com",
      },
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.updateUserProfile(req, res);

    expect(userService.updateProfile).toHaveBeenCalledWith(
      1,
      "Nanimz",
      "nanimz@example.com",
    );
    expect(userService.updateProfile).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Profil berhasil diperbarui",
      data: mockUser,
    });
  });

  test("should return 409 if email updated email already registered", async () => {
    const error = new Error("Email sudah digunakan");
    error.statusCode = 409;
    userService.updateProfile.mockRejectedValue(error);

    const req = mockRequest({
      body: {
        name: "Nanimz",
        email: "nanimz@example.com",
      },
      user: {
        id: 1,
      },
    });

    const res = mockResponse();

    await userController.updateUserProfile(req, res);

    expect(userService.updateProfile).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Email sudah digunakan",
    });
  });

  test("should return 500 if server error occurs", async () => {
    userService.updateProfile.mockRejectedValue(new Error("Connection failed"));

    const req = mockRequest({
      body: {
        name: "Nanimz",
        email: "Nanimz@exmaple.com",
      },
      user: {
        id: 1,
      },
    });

    const res = mockResponse();

    await userController.updateUserProfile(req, res);

    expect(userService.updateProfile).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  });
});
