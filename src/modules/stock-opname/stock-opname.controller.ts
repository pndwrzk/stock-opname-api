import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/response";
import { ListStockOpnameQuery } from "./stock-opname.interface";
import { stockOpnameService } from "./stock-opname.service";

export const stockOpnameController = {
  initiate: catchAsync(async (req: Request, res: Response) => {
    const opname = await stockOpnameService.initiate(req.user!!, req.body);
    sendSuccess(res, opname, "Stock opname initiated", 201);
  }),

  findAll: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await stockOpnameService.findAll(
      req.user!!,
      req.query as unknown as ListStockOpnameQuery
    );
    sendSuccess(res, items, "Stock opnames retrieved", 200, meta);
  }),

  findById: catchAsync(async (req: Request, res: Response) => {
    const opname = await stockOpnameService.findById(req.user!!, req.params.id as string);
    sendSuccess(res, opname, "Stock opname retrieved");
  }),
};