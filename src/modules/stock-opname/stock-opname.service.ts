import { ROLES } from "../../constants/roles";
import { OPNAME_SCOPE } from "../../constants/stock-opname";
import { AuthUser } from "../../types/auth";
import { ApiError } from "../../utils/ApiError";
import { storeStockRepository } from "../store-stock/store-stock.repository";
import {
  CreateStockOpnameDto,
  ListStockOpnameQuery,
} from "./stock-opname.interface";
import {
  stockOpnameRepository,
  StockOpnameDetail,
} from "./stock-opname.repository";

export const stockOpnameService = {
  async initiate(
    actor: AuthUser,
    dto: CreateStockOpnameDto,
  ): Promise<StockOpnameDetail> {
    if (!actor.storeId)
      throw new ApiError(403, "Your account is not assigned to a store");
    const storeId = actor.storeId;

    if (actor.role !== ROLES.MANAGER) {
      throw new ApiError(
        403,
        "You are not authorized to initiate stock opname",
      );
    }

    const active = await stockOpnameRepository.findActiveByStore(storeId);
    if (active)
      throw new ApiError(409, "This store already has an active stock opname");

    const isAll = dto.scope === OPNAME_SCOPE.ALL;
    const stocks = await storeStockRepository.findQuantities(
      storeId,
      isAll ? undefined : dto.productIds,
    );

    if (isAll) {
      if (stocks.length === 0)
        throw new ApiError(422, "This store has no stock to count");
    } else {
      const found = new Set(stocks.map((s) => s.productId));
      const missing = (dto.productIds ?? []).filter((id) => !found.has(id));
      if (missing.length > 0) {
        throw new ApiError(
          422,
          "Some products have no stock record in this store",
          {
            productIds: missing,
          },
        );
      }
    }

    return stockOpnameRepository.create({
      storeId,
      scope: dto.scope,
      note: dto.note,
      initiatedBy: actor.id,
      items: stocks.map((s) => ({
        productId: s.productId,
        systemQty: s.quantity,
      })),
    });
  },

  async findAll(actor: AuthUser, query: ListStockOpnameQuery) {
    const storeId =
      actor.role === ROLES.MANAGER || actor.role === ROLES.STAFF
        ? query.storeId
        : undefined;
    if (actor.role !== ROLES.OWNER && !storeId) {
      throw new ApiError(403, "Your account is not assigned to a store");
    }

    const { items, total } = await stockOpnameRepository.findAll({
      ...query,
      storeId,
    });
    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async findById(actor: AuthUser, id: string): Promise<StockOpnameDetail> {
    const opname = await stockOpnameRepository.findById(id);
    if (!opname) throw new ApiError(404, "Stock opname not found");
    return opname;
  },
};
