import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Demo Account",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "demo@example.com" },
      name: { label: "Name", type: "text", placeholder: "Maya" },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;

      const { email, name } = credentials;
      const user = await prisma.user.upsert({
        where: { email },
        update: name ? { name } : {},
        create: {
          email,
          name: name || email.split('@')[0],
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
