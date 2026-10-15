import { Prisma, Product } from "@prisma/client";
import { prisma } from "../../config";
import { CreateProductDto, ListProductQuery, UpdateProductDto } from "./product.interface";

export const productRepository = {
  create(data: CreateProductDto): Promise<Product> {
    return prisma.product.create({ data });
  },

  async findAll({
    page,
    limit,
    search,
  }: ListProductQuery): Promise<{ items: Product[]; total: number }> {
    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { sku: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  },

  findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { sku } });
  },

  update(id: string, data: UpdateProductDto): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  },
};