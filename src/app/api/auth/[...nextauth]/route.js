import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * NextAuth Configuration Options
 * Provides credential authentication using Prisma user database and JWT session strategy.
 */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      /**
       * Authorize user by verifying email and comparing bcrypt hashed password.
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // Look up user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Compare password hash
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Return user session payload
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    // Inject user id and role into JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Populate session user object with id and role from JWT token
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/", // Redirect to home/login page for signing in
  },
  session: {
    strategy: "jwt", // Use stateless JWT session strategy
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_purposes_only",
};

// Create NextAuth handler for handling GET and POST requests
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
