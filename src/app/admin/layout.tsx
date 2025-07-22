"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { 
  Calendar, 
  Users, 
  Settings, 
  Home,
  LogOut,
  Briefcase
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/login")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div>Cargando...</div>
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Panel Admin</h1>
          <p className="text-sm text-gray-500">Booking Now</p>
        </div>
        
        <nav className="mt-6">
          <Link 
            href="/admin" 
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          
          <Link 
            href="/admin/services" 
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            <Briefcase className="w-5 h-5 mr-3" />
            Servicios
          </Link>
          
          <Link 
            href="/admin/professionals" 
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            <Users className="w-5 h-5 mr-3" />
            Profesionales
          </Link>
          
          <Link 
            href="/admin/bookings" 
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            <Calendar className="w-5 h-5 mr-3" />
            Reservas
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">
              {session.user?.name || session.user?.email}
            </p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
          
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}