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


const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10);

const invalidCredentials = () => new ApiError(401, "Invalid username or password");
const invalidRefresh = () => new ApiError(401, "Invalid or expired refresh token");

const issueTokens = (user: AuthUser) => ({
  accessToken: signAccessToken(user),
  refreshToken: signRefreshToken(user.id),
});

export const authService = {
  async login({ username, password }: LoginDto) {
    const found = await userRepository.findByUsernameWithPassword(username);

    const valid = await comparePassword(password, found?.password ?? DUMMY_HASH);
    if (!found || !valid) throw invalidCredentials();

    const user = await userRepository.findById(found.id); // versi aman: tanpa password, dengan store
    if (!user) throw invalidCredentials();

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
      throw invalidRefresh();
    }

    // ambil role/toko terbaru dari database, bukan dari token
    const user = await userRepository.findById(userId);
    if (!user) throw invalidRefresh();

    return issueTokens({ id: user.id, role: user.role, storeId: user.storeId });
  },
};