import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { userController } from "./user.controller";
import {
  createUserSchema,
  listUserQuerySchema,
  updateUserSchema,
  userIdParamSchema,
} from "./user.validation";

const router = Router();

router
  .route("/")
  .get(validate({ query: listUserQuerySchema }), userController.findAll)
  .post(validate({ body: createUserSchema }), userController.create);

router
  .route("/:id")
  .get(validate({ params: userIdParamSchema }), userController.findById)
  .patch(validate({ params: userIdParamSchema, body: updateUserSchema }), userController.update)
  .delete(validate({ params: userIdParamSchema }), userController.remove);

export default router;