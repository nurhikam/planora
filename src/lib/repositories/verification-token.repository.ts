import { prisma } from "@/lib/prisma";

export const verificationTokenRepository = {
  findByToken(token: string) {
    return prisma.verificationToken.findUnique({ where: { token } });
  },

  create(data: { token: string; userId: string; expires: Date }) {
    return prisma.verificationToken.create({ data });
  },

  delete(id: string) {
    return prisma.verificationToken.delete({ where: { id } });
  },
};
