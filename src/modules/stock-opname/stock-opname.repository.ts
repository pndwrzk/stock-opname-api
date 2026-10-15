import { Prisma } from "@prisma/client";
import { prisma } from "../../config";
import {
  ACTIVE_OPNAME_STATUSES,
  OPNAME_STATUS,
  OpnameScope,
  OpnameStatus,
} from "../../constants/stock-opname";

const detailInclude = {
  store: { select: { id: true, code: true, name: true } },
  initiator: { select: { id: true, name: true } },
  items: {
    select: {
      id: true,
      productId: true,
      systemQty: true,
      countedQty: true,
      product: { select: { id: true, sku: true, name: true } },
    },
    orderBy: { product: { sku: "asc" } },
  },
  histories: {
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      note: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.StockOpnameInclude;

const listInclude = {
  store: { select: { id: true, code: true, name: true } },
  initiator: { select: { id: true, name: true } },
  _count: { select: { items: true } },
} satisfies Prisma.StockOpnameInclude;

export type StockOpnameDetail = Prisma.StockOpnameGetPayload<{
  include: typeof detailInclude;
}>;
export type StockOpnameListItem = Prisma.StockOpnameGetPayload<{
  include: typeof listInclude;
}>;

export interface CreateStockOpnameData {
  storeId: string;
  scope: OpnameScope;
  note?: string;
  initiatedBy: string;
  items: { productId: string; systemQty: number }[];
}

export const stockOpnameRepository = {
  create(data: CreateStockOpnameData): Promise<StockOpnameDetail> {
    return prisma.stockOpname.create({
      data: {
        storeId: data.storeId,
        scope: data.scope,
        note: data.note,
        initiatedBy: data.initiatedBy,
        items: { create: data.items },
        histories: {
          create: {
            fromStatus: null,
            toStatus: OPNAME_STATUS.INITIATED,
            userId: data.initiatedBy,
            note: data.note,
          },
        },
      },
      include: detailInclude,
    });
  },

  findActiveByStore(storeId: string): Promise<{ id: string } | null> {
    return prisma.stockOpname.findFirst({
      where: { storeId, status: { in: ACTIVE_OPNAME_STATUSES } },
      select: { id: true },
    });
  },

  async findAll(params: {
    page: number;
    limit: number;
    status?: number;
    storeId?: string;
  }): Promise<{ items: StockOpnameListItem[]; total: number }> {
    const { page, limit, status, storeId } = params;
    const where: Prisma.StockOpnameWhereInput = {
      ...(status !== undefined && { status }),
      ...(storeId && { storeId }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.stockOpname.findMany({
        where,
        include: listInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockOpname.count({ where }),
    ]);

    return { items, total };
  },

  transition(params: {
    id: string;
    from: OpnameStatus;
    to: OpnameStatus;
    actorId: string;
    note?: string;
  }): Promise<boolean> {
    const { id, from, to, actorId, note } = params;
    return prisma.$transaction(async (tx) => {
      const { count } = await tx.stockOpname.updateMany({
        where: { id, status: from },
        data: { status: to },
      });
      if (count === 0) return false;

      await tx.stockOpnameHistory.create({
        data: {
          opnameId: id,
          fromStatus: from,
          toStatus: to,
          userId: actorId,
          note,
        },
      });
      return true;
    });
  },

  findById(id: string): Promise<StockOpnameDetail | null> {
    return prisma.stockOpname.findUnique({
      where: { id },
      include: detailInclude,
    });
  },
};
