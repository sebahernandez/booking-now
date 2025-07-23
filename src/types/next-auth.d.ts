import "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface User {
    role: UserRole
    tenantId?: string
    isTenant?: boolean
  }

  interface Session {
    user: User & {
      id: string
      role: UserRole
      tenantId?: string
      isTenant?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    tenantId?: string
    isTenant?: boolean
  }
}