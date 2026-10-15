import { z } from "zod";
import { createStockOpnameSchema, listStockOpnameQuerySchema } from "./stock-opname.validation";

export type CreateStockOpnameDto = z.infer<typeof createStockOpnameSchema>;
export type ListStockOpnameQuery = z.infer<typeof listStockOpnameQuerySchema>;