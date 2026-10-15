import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { authController } from "./auth.controller";
import { loginSchema, refreshSchema } from "./auth.validation";

const router = Router();

router.post("/login", validate({ body: loginSchema }), authController.login);
router.post("/refresh", validate({ body: refreshSchema }), authController.refresh);

export default router;