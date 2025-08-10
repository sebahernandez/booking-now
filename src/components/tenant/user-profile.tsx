"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  Key,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
} from "lucide-react";

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UserProfile() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async () => {
    if (!profileData.name.trim()) {
      showError("El nombre es requerido");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/tenant/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name.trim(),
          phone: profileData.phone.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el perfil");
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          name: profileData.name.trim(),
        },
      });

      showSuccess("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (error) {
      showError("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showError("Todos los campos son requeridos");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Las contraseñas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch("/api/tenant/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar la contraseña");
      }

      showSuccess("Contraseña cambiada correctamente");
      setIsPasswordModalOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      showError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!session?.user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Administra tu información personal y configuración de cuenta
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    setProfileData({
                      name: session?.user?.name || "",
                      email: session?.user?.email || "",
                      phone: "",
                    });
                  }
                  setIsEditing(!isEditing);
                }}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="Tu nombre completo"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{session.user.name || "Sin nombre"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{session.user.email}</span>
              </div>
              <p className="text-xs text-gray-500">
                El correo electrónico no se puede modificar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (Opcional)</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="+1234567890"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{profileData.phone || "No especificado"}</span>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar Cambios
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Seguridad de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Cuenta</Label>
              <div className="flex items-center gap-2">
                <Badge variant={session.user.isTenant ? "default" : "secondary"}>
                  {session.user.isTenant ? "Tenant" : "Usuario"}
                </Badge>
                <Badge variant="outline">{session.user.role}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>ID de Cuenta</Label>
              <div className="p-2 bg-gray-50 rounded-md">
                <span className="text-sm font-mono text-gray-600">
                  {session.user.id}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">••••••••</span>
                </div>
                <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Cambiar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Contraseña</DialogTitle>
                      <DialogDescription>
                        Ingresa tu contraseña actual y la nueva contraseña para tu cuenta.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Contraseña Actual</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Ingresa tu contraseña actual"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Ingresa tu nueva contraseña"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Confirma tu nueva contraseña"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsPasswordModalOpen(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handlePasswordChange} disabled={passwordLoading}>
                        {passwordLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : null}
                        Cambiar Contraseña
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Estado de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Activa
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>Cuenta creada</Label>
                <p className="text-sm text-gray-600">
                  {session.user.tenantId ? "Cuenta de Tenant" : "Cuenta de Usuario"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Último acceso</Label>
                <p className="text-sm text-gray-600">Sesión actual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}