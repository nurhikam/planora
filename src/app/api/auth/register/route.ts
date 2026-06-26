import { authService } from "@/lib/services/auth.service";
import { emailService } from "@/lib/services/email.service";
import { registerSchema } from "@/lib/validations";
import { handleApiError, ValidationError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const { name, email, password } = parsed.data;
    const { user, token } = await authService.register(name, email, password);

    await emailService.sendVerificationEmail(email, token);

    return Response.json(
      { data: { id: user.id, name: user.name, email: user.email }, message: "User created. Check your email to verify." },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
