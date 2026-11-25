import { jest, describe, test, expect } from "@jest/globals";

jest.unstable_mockModule("../../../../src/service/user.mjs", () => ({
  default: {
    getProfile: jest.fn(),
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

describe("User Controller - Get Profile", () => {
  test("should return 404 if user is not found", async () => {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    userService.getProfile.mockRejectedValue(error);

    const req = mockRequest({
      user: {
        id: 1,
      },
    });

    const res = mockResponse();

    await userController.getMe(req, res);

    expect(userService.getProfile).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User tidak ditemukan",
    });
  });

  test("should return 200 get profil success", async () => {
    const mockUser = {
      id: 1,
      name: "Nanimz",
      email: "nanimz@example.com",
    };

    userService.getProfile.mockResolvedValue(mockUser);

    const req = mockRequest({
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.getMe(req, res);

    expect(userService.getProfile).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockUser,
    });
  });

  test("should return 500 if server error occurs", async () => {
    userService.getProfile.mockRejectedValue(new Error("Connection failed"));

    const req = mockRequest({
      user: {
        id: 1,
      },
    });
    const res = mockResponse();

    await userController.getMe(req, res);

    expect(userService.getProfile).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  });
});
