import { jest, describe, test, expect } from "@jest/globals";

jest.unstable_mockModule("../../../src/service/user.mjs", () => ({
  default: {
    login: jest.fn(),
  },
}));

const { default: userService } = await import("../../../src/service/user.mjs");
const { default: authController } =
  await import("../../../src/controllers/auth.mjs");

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
});
