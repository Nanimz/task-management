import { jest, describe, test, expect } from "@jest/globals";

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
});
