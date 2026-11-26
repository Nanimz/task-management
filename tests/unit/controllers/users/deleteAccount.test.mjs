import { jest, describe, test, expect } from "@jest/globals";

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
});
