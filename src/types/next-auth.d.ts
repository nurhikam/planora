import "next-auth";

declare module "next-auth" {
  interface User {
    emailVerified?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      emailVerified?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    emailVerified?: string;
  }
}
