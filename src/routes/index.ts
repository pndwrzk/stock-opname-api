import { Router } from "express";
import storeRoutes from "../modules/store/store.route";
import userRoutes from "../modules/user/user.route";
import authRoutes from "../modules/auth/auth.route";
import { ROLES } from "../constants/roles";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));
router.use("/auth", authRoutes);
router.use("/stores", storeRoutes);
router.use("/users", userRoutes);
router.use("/users", authenticate, authorize(ROLES.OWNER), userRoutes);


export default router;