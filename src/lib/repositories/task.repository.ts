import { prisma } from "@/lib/prisma";
import type { TaskStatus, Prisma } from "@prisma/client";

export const taskRepository = {
  findById(id: string) {
    return prisma.task.findUnique({ where: { id } });
  },

  findByUser(
    userId: string,
    filters?: {
      date?: string;
      status?: TaskStatus;
      search?: string;
      sort?: "newest" | "oldest" | "title-asc" | "title-desc";
      page?: number;
      limit?: number;
    },
  ) {
    const where: Prisma.TaskWhereInput = { userId };

    if (filters?.date) {
      const start = new Date(filters.date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      where.date = { gte: start, lt: end };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;

    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    const sort = filters?.sort || "newest";

    if (sort === "newest") {
      orderBy.createdAt = "desc";
    } else if (sort === "oldest") {
      orderBy.createdAt = "asc";
    } else if (sort === "title-asc") {
      orderBy.title = "asc";
    } else if (sort === "title-desc") {
      orderBy.title = "desc";
    }

    return prisma.task.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });
  },

  create(data: {
    title: string;
    description?: string;
    date: Date;
    status?: TaskStatus;
    userId: string;
  }) {
    return prisma.task.create({ data });
  },

  update(
    id: string,
    data: {
      title?: string;
      description?: string;
      date?: Date;
      status?: TaskStatus;
    },
  ) {
    return prisma.task.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },

  countByUser(
    userId: string,
    filters?: { date?: string; status?: TaskStatus; search?: string },
  ) {
    const where: Prisma.TaskWhereInput = { userId };

    if (filters?.date) {
      const start = new Date(filters.date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      where.date = { gte: start, lt: end };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.task.count({ where });
  },
};
