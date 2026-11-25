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
  return { body };
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
});
