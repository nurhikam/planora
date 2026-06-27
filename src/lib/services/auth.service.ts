import { hash, compare } from "bcrypt-ts";
import { userRepository } from "@/lib/repositories/user.repository";
import { verificationTokenRepository } from "@/lib/repositories/verification-token.repository";
import { emailService } from "@/lib/services/email.service";
import { AuthError, ValidationError } from "@/lib/errors";

const SALT_ROUNDS = 12;

export const authService = {
  async register(name: string, email: string, password: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ValidationError([
        { field: "email", message: "Email already registered" },
      ]);
    }

    const passwordHash = await hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ name, email, passwordHash });

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await verificationTokenRepository.create({
      token,
      userId: user.id,
      expires,
    });

    await emailService.sendVerificationEmail(user.email, token);

    return { user: { id: user.id, name: user.name, email: user.email }, token };
  },

  async verifyEmail(token: string) {
    const vt = await verificationTokenRepository.findByToken(token);
    if (!vt || vt.expires < new Date()) {
      throw new ValidationError([
        { field: "token", message: "Invalid or expired token" },
      ]);
    }

    await userRepository.update(vt.userId, { emailVerified: new Date() });
    await verificationTokenRepository.delete(vt.id);

    return userRepository.findById(vt.userId);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthError("Invalid email or password");
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      throw new AuthError("Invalid email or password");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    };
  },
};
