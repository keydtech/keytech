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

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function allowLoginAttempt(username: string) {
  const now = Date.now();
  const key = username.toLowerCase();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (current.count >= 8) return false;
  current.count += 1;
  return true;
}

function clearLoginAttempts(username: string) {
  loginAttempts.delete(username.toLowerCase());
}

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

        const username = parsed.data.username.toLowerCase();
        if (!allowLoginAttempt(username)) return null;

        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        clearLoginAttempts(username);

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
        token.active = true;
        token.checkedAt = Date.now();
        return token;
      }

      // Refresh role/active from DB periodically so deactivate/role changes apply.
      const checkedAt =
        typeof token.checkedAt === "number" ? token.checkedAt : 0;
      const id = typeof token.id === "string" ? token.id : "";
      if (id && Date.now() - checkedAt > 5 * 60 * 1000) {
        const dbUser = await prisma.user.findUnique({
          where: { id },
          select: {
            active: true,
            role: true,
            name: true,
            username: true,
          },
        });
        if (!dbUser || !dbUser.active) {
          return { ...token, active: false };
        }
        token.active = true;
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.username = dbUser.username;
        token.checkedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (token.active === false) {
        return { ...session, user: undefined as unknown as SessionUser };
      }

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
