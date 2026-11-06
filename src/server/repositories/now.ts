import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const nowRepository = {
  async findActive() {
    return prisma.nowItem.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
  },

  async findAll() {
    return prisma.nowItem.findMany({ orderBy: { displayOrder: "asc" } });
  },

  async findById(id: string) {
    return prisma.nowItem.findUnique({ where: { id } });
  },

  async create(data: Prisma.NowItemCreateInput) {
    return prisma.nowItem.create({ data });
  },

  async update(id: string, data: Prisma.NowItemUpdateInput) {
    return prisma.nowItem.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.nowItem.delete({ where: { id } });
  },
};
