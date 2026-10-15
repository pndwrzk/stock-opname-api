import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { stockOpnameController } from "./stock-opname.controller";
import {
  createStockOpnameSchema,
  listStockOpnameQuerySchema,
  stockOpnameIdParamSchema,
} from "./stock-opname.validation";

const router = Router();


router
  .route("/")
  .get(validate({ query: listStockOpnameQuerySchema }), stockOpnameController.findAll)
  
  .post(
    validate({ body: createStockOpnameSchema }),
    stockOpnameController.initiate
  );

router.get(
  "/:id",
  validate({ params: stockOpnameIdParamSchema }),
  stockOpnameController.findById
);

export default router;