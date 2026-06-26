import { prisma } from "@/lib/prisma";

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({ data });
  },

  update(id: string, data: { emailVerified?: Date }) {
    return prisma.user.update({ where: { id }, data });
  },
};
