import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "@/lib/errors";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AuthError();

    const body = await request.json();
    const { name } = profileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to update profile";
    console.error("[Profile] Error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
