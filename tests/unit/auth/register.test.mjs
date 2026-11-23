import { jest, describe, test, expect } from "@jest/globals";

jest.unstable_mockModule("../../../src/service/user.mjs", () => ({
  default: {
    register: jest.fn(),
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
});
