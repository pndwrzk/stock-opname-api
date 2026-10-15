import { Prisma } from "@prisma/client";
import { prisma } from "../../config";
import { ACTIVE_OPNAME_STATUSES, OpnameScope } from "../../constants/stock-opname";

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
} satisfies Prisma.StockOpnameInclude;

const listInclude = {
  store: { select: { id: true, code: true, name: true } },
  initiator: { select: { id: true, name: true } },
  _count: { select: { items: true } },
} satisfies Prisma.StockOpnameInclude;

export type StockOpnameDetail = Prisma.StockOpnameGetPayload<{ include: typeof detailInclude }>;
export type StockOpnameListItem = Prisma.StockOpnameGetPayload<{ include: typeof listInclude }>;

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

  findById(id: string): Promise<StockOpnameDetail | null> {
    return prisma.stockOpname.findUnique({ where: { id }, include: detailInclude });
  },
};