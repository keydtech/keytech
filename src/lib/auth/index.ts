import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/auth/rbac";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

declare module "next-auth" {
  interface User {
    username: string;
    role: Role;
  }

  interface Session {
    user: SessionUser;
  }
}

const credentialsSchema = z.object({
  username: z.string().min(2).max(64),
  password: z.string().min(6).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { username: parsed.data.username.toLowerCase() },
        });

        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      const id = typeof token.id === "string" ? token.id : "";
      const username =
        typeof token.username === "string" ? token.username : "";
      const role = token.role as Role | undefined;
      const name =
        typeof token.name === "string" ? token.name : username;

      if (id && username && role) {
        (session as { user: SessionUser }).user = {
          id,
          name,
          username,
          role,
        };
      }
      return session;
    },
  },
});
