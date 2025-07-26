"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminBookingsPage() {
  const { data: session } = useSession();

  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p>No tienes permisos para acceder a esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Reservas - Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Funcionalidad de gestión de reservas para administradores en
            desarrollo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
