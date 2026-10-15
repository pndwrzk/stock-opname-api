import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { storeStockController } from "./store-stock.controller";
import {
  createStoreStockSchema,
  listStoreStockQuerySchema,
  storeStockIdParamSchema,
} from "./store-stock.validation";

const router = Router();

router
  .route("/")
  .get(validate({ query: listStoreStockQuerySchema }), storeStockController.findAll)
  .post(validate({ body: createStoreStockSchema }), storeStockController.create);

router
  .route("/:id")
  .get(validate({ params: storeStockIdParamSchema }), storeStockController.findById)
  .delete(validate({ params: storeStockIdParamSchema }), storeStockController.remove);

export default router;