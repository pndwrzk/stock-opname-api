import { AuthUser } from "../utils/token";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};