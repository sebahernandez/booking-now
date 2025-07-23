"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, Settings, Building2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      // Si el usuario está logueado, redirigir según su rol
      if (session.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        // Para otros roles, podrías redirigir a un dashboard específico
        router.push("/admin");
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no hay sesión, mostrar página de bienvenida/login
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">B</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BookingNow</h1>
                <p className="text-sm text-gray-600">
                  Sistema de Reservas Profesional
                </p>
              </div>
            </div>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Gestiona tus reservas de manera
            <span className="text-blue-600"> profesional</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            BookingNow te permite administrar servicios, profesionales y
            reservas con un sistema completo que incluye widgets embebibles para
            tu sitio web.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Acceder al Panel
              </Button>
            </Link>
            <Link href="/admin/widget">
              <Button size="lg" variant="outline">
                Ver Widget Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Gestión de Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Administra todas las reservas desde un panel centralizado con
                estados y notificaciones.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Profesionales</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Gestiona horarios, servicios y disponibilidad de cada
                profesional.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
            <CardHeader className="text-center">
              <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Define servicios, precios, duraciones y asignaciones a
                profesionales.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
            <CardHeader className="text-center">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Widget Embebible</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Integra el sistema de reservas en cualquier sitio web con código
                iframe.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50 p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Listo para comenzar?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Accede al panel de administración para configurar tu sistema de
            reservas.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Iniciar Sesión Ahora
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-200/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2025 BookingNow. Sistema de reservas profesional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
