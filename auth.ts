import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isEmailAllowed } from "@/lib/auth/allowlist";
import { prisma } from "@/lib/prisma";

declare module "@auth/core/types" {
  interface User {
    id: string;
  }
  interface Session {
    user: User;
  }
}

const config = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/calendar.readonly"
          ].join(" ")
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Check if email is in allowlist
      if (!user.email || !isEmailAllowed(user.email)) {
        return false;
      }

      try {
        // Find or create user
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          // Create new user with Google info
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || profile?.name || null,
              image: user.image || profile?.picture || null,
              emailVerified: profile?.email_verified ? new Date() : null,
              googleRefreshToken: account?.refresh_token || null
            }
          });
        } else {
          // Update existing user with refresh token if provided
          if (account?.refresh_token) {
            await prisma.user.update({
              where: { email: user.email },
              data: {
                googleRefreshToken: account.refresh_token,
                name: user.name || profile?.name || existingUser.name,
                image: user.image || profile?.picture || existingUser.image
              }
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account, profile }: any) {
      // On sign in, fetch the user ID from database
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }

      if (account?.refresh_token) {
        token.refreshToken = account.refresh_token;
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/"
  }
};

// @ts-ignore - NextAuth v5 beta has callable type inference issues in production builds
export const { handlers, signIn, signOut, auth } = NextAuth(config);
