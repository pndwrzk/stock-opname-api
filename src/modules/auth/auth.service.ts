import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/ApiError";
import { comparePassword } from "../../utils/password";
import {
  AuthUser,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/token";
import { userRepository } from "../user/user.repository";
import { LoginDto } from "./auth.interface";

const issueTokens = (user: AuthUser) => ({
  accessToken: signAccessToken(user),
  refreshToken: signRefreshToken(user.id),
});

export const authService = {
  async login({ username, password }: LoginDto) {
    const found = await userRepository.findByUsernameWithPassword(username);

    if (!found) {
      throw new ApiError(401, "Invalid username or password");
    }

    const valid = await comparePassword(password, found?.password);
    if (!valid) {
      throw new ApiError(401, "Invalid username or password");
    }

    const user = {
      username: found.username,
      id: found.id,
      role: found.role,
      storeId: found.storeId ?? null,
    };

    return {
      ...issueTokens({ id: user.id, role: user.role, storeId: user.storeId }),
      user,
    };
  },

  async refresh(refreshToken: string) {
    let userId: string;
    try {
      userId = verifyRefreshToken(refreshToken).sub as string;
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(401, "Invalid or expired refresh token");

    return issueTokens({ id: user.id, role: user.role, storeId: user.storeId });
  },
};
