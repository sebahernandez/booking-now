import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

// Environment variables are automatically loaded by Next.js

// Create a new Prisma client specifically for auth
const authPrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export const authOptions: NextAuthOptions = {
  debug: true, // Always enable debug for troubleshooting
  logger: {
    error(code) {
      console.error('NextAuth Error:', code)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug() {
      // Debug logging disabled
    }
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // First try to find a regular user
          const user = await authPrisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase().trim(),
            },
          });

          console.log("👤 User found:", {
            exists: !!user,
            email: user?.email,
            role: user?.role,
            hasPassword: !!user?.password
          });

          if (user && user.password) {
            console.log("🔐 Comparing passwords...");
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            );

            console.log("🔑 Password validation result:", isPasswordValid);

            if (isPasswordValid) {
              console.log("✅ User login successful for:", user.email);
              const returnUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId || undefined,
                isTenant: false,
              };
              console.log("📤 Returning user object:", returnUser);
              return returnUser;
            } else {
              console.log("❌ Password validation failed");
            }
          } else {
            console.log("❌ User not found or has no password");
          }

          // If no user found or password invalid, try tenant login
          const tenant = await authPrisma.tenant.findUnique({
            where: {
              email: credentials.email.toLowerCase().trim(),
            },
          });

          console.log("🏢 Tenant found:", {
            exists: !!tenant,
            email: tenant?.email,
            isActive: tenant?.isActive,
          });

          if (!tenant || !tenant.isActive) {
            console.log("❌ Tenant not found or inactive");
            return null;
          }

          const isTenantPasswordValid = await bcrypt.compare(
            credentials.password,
            tenant.password
          );

          console.log("🔒 Tenant password valid:", isTenantPasswordValid);

          if (!isTenantPasswordValid) {
            console.log("❌ Invalid tenant password");
            return null;
          }

          console.log("✅ Tenant login successful for:", tenant.email);

          return {
            id: tenant.id,
            email: tenant.email,
            name: tenant.name,
            role: "CLIENT" as UserRole, // Tenants are treated as clients
            tenantId: tenant.id,
            isTenant: true,
          };
        } catch (error) {
          console.error("❌ Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.isTenant = user.isTenant;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.isTenant = token.isTenant;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
