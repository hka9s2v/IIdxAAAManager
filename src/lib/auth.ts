import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.usernameOrEmail || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.usernameOrEmail },
              { email: credentials.usernameOrEmail },
            ],
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        if (!user.isActive) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.displayName || user.username,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        // user.username の型安全性を確保
        if ('username' in user) {
          token.username = (user as { username: string }).username;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      // token.username の型安全性を確保
      if ('username' in session.user && 'username' in token) {
        (session.user as { username: string }).username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  secret: process.env.NEXTAUTH_SECRET,
};