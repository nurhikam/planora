/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { hash } = require("bcrypt-ts");

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash("demo123456", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@planora.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@planora.app",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = [
    {
      title: "Design review meeting",
      description: "Review the new dashboard mockups",
      date: today,
      status: "IN_PROGRESS",
      userId: user.id,
    },
    {
      title: "Update project roadmap",
      description: "",
      date: today,
      status: "NOT_STARTED",
      userId: user.id,
    },
    {
      title: "Code review - PR #42",
      description: "Review the authentication module",
      date: today,
      status: "DONE",
      userId: user.id,
    },
    {
      title: "Prepare demo presentation",
      description: "Slides for the client meeting",
      date: tomorrow,
      status: "NOT_STARTED",
      userId: user.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log("Seed complete: 1 user, 4 tasks");
  console.log("Demo credentials: demo@planora.app / demo123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // For Neon adapter, also cleanup if needed
    if (adapter) {
      await adapter.$disconnect();
    }
  });
