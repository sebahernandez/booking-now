import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔍 Authorize called with:", { email: credentials?.email, hasPassword: !!credentials?.password })
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        try {
          // First try to find a regular user
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase().trim()
            }
          })

          if (user && user.password) {
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            )

            if (isPasswordValid) {
              console.log("✅ User login successful for:", user.email)
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
                isTenant: false,
              }
            }
          }

          // If no user found or password invalid, try tenant login
          const tenant = await prisma.tenant.findUnique({
            where: {
              email: credentials.email.toLowerCase().trim()
            }
          })

          console.log("🏢 Tenant found:", { 
            exists: !!tenant, 
            email: tenant?.email, 
            isActive: tenant?.isActive
          })

          if (!tenant || !tenant.isActive) {
            console.log("❌ Tenant not found or inactive")
            return null
          }

          const isTenantPasswordValid = await bcrypt.compare(
            credentials.password,
            tenant.password
          )

          console.log("🔒 Tenant password valid:", isTenantPasswordValid)

          if (!isTenantPasswordValid) {
            console.log("❌ Invalid tenant password")
            return null
          }

          console.log("✅ Tenant login successful for:", tenant.email)
          
          return {
            id: tenant.id,
            email: tenant.email,
            name: tenant.name,
            role: "CLIENT" as UserRole, // Tenants are treated as clients
            tenantId: tenant.id,
            isTenant: true,
          }
        } catch (error) {
          console.error("❌ Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.tenantId = user.tenantId
        token.isTenant = user.isTenant
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.tenantId = token.tenantId
        session.user.isTenant = token.isTenant
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
}