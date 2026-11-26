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
});
