import { jest, describe, test, expect } from "@jest/globals";

jest.unstable_mockModule("../../../../src/service/refreshTokens.mjs", () => ({
  default: {
    logout: jest.fn(),
  },
}));

const { default: tokenService } =
  await import("../../../../src/service/refreshTokens.mjs");
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

describe("Authentication - Logout", () => {
  test("should return 401 if refresh token is missing", async () => {
    const req = mockRequest({});
    const res = mockResponse();

    await authController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Refresh token wajib ada",
    });
    expect(tokenService.logout).not.toHaveBeenCalled();
  });

  test("should return error status and message from service if statusCode exists", async () => {
    const error = new Error("Refresh token tidak valid atau kadaluarsa");
    error.statusCode = 401;
    tokenService.logout.mockRejectedValue(error);

    const req = mockRequest({
      refreshToken: "refresh-token-123",
    });
    const res = mockResponse();

    await authController.logout(req, res);

    expect(tokenService.logout).toHaveBeenCalledWith("refresh-token-123");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Refresh token tidak valid atau kadaluarsa",
    });
  });

  test("should return 200 user logout successful", async () => {
    tokenService.logout.mockResolvedValue(undefined);

    const req = mockRequest({
      refreshToken: "refresh-token-123",
    });
    const res = mockResponse();

    await authController.logout(req, res);

    expect(tokenService.logout).toHaveBeenCalledWith("refresh-token-123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Logout berhasil",
    });
  });
});
