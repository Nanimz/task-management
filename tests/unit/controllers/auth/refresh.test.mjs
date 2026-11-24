import { jest, describe, test, expect } from "@jest/globals";
import refreshTokens from "../../../../src/models/refreshTokens.mjs";

jest.unstable_mockModule("../../../../src/service/refreshTokens.mjs", () => ({
  default: {
    refresh: jest.fn(),
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

describe("Authentication - Refresh Token", () => {
  test("should return 400 if refresh token is missing", async () => {
    const req = mockRequest({});
    const res = mockResponse();

    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Refresh token wajib diisi",
    });
    expect(tokenService.refresh).not.toHaveBeenCalled();
  });

  test("should return 200 and tokens if refresh is successful", async () => {
    tokenService.refresh.mockResolvedValue("refresh-token-123");

    const req = mockRequest({
      refreshToken: "refresh-token-123",
    });
    const res = mockResponse();

    await authController.refresh(req, res);

    expect(tokenService.refresh).toHaveBeenCalledWith("refresh-token-123");
    expect(tokenService.refresh).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: "refresh-token-123",
    });
  });

  test("should return error status and messsage from service if statusCode exists", async () => {
    const error = new Error("Refresh token tidak valid atau kadaluarsa");
    error.statusCode = 401;
    tokenService.refresh.mockRejectedValue(error);

    const req = mockRequest({
      refreshToken: "refresh-token-123",
    });

    const res = mockResponse();

    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Refresh token tidak valid atau kadaluarsa",
    });
  });

  test("should return 500 if unexpected server error occurs", async () => {
    tokenService.refresh.mockRejectedValue(new Error("Connection failed"));

    const req = mockRequest({
      refreshToken: "refresh-token-123",
    });

    const res = mockResponse();

    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Terjadi kesalahan di server",
    });
  });
});
