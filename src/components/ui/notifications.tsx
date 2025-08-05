"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, User, Clock, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Notification {
  id: string;
  type: "NEW_BOOKING" | "BOOKING_CANCELLED" | "BOOKING_UPDATED";
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  bookingId?: string;
  clientName?: string;
  serviceName?: string;
}

interface NotificationsProps {
  tenantId?: string;
}

export function Notifications({ tenantId }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetchNotifications();
      // Configurar polling cada 15 segundos para nuevas notificaciones (más frecuente)
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [tenantId]);

  // Efecto para actualizar notificaciones cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && tenantId) {
      fetchNotifications();
    }
  }, [isOpen, tenantId]);

  // Listener para eventos de nueva notificación
  useEffect(() => {
    const handleNewNotification = () => {
      if (tenantId) {
        fetchNotifications();
      }
    };

    window.addEventListener('newNotification', handleNewNotification);
    return () => window.removeEventListener('newNotification', handleNewNotification);
  }, [tenantId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/tenant/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };


  const markAllAsRead = async () => {
    try {
      await fetch(`/api/tenant/notifications/mark-all-read`, {
        method: "PUT",
      });
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/tenant/notifications/${notificationId}`, {
        method: "DELETE",
      });
      
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "NEW_BOOKING":
        return <Calendar className="w-4 h-4 text-green-600" />;
      case "BOOKING_CANCELLED":
        return <X className="w-4 h-4 text-red-600" />;
      case "BOOKING_UPDATED":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "NEW_BOOKING":
        return "bg-green-50 border-green-200";
      case "BOOKING_CANCELLED":
        return "bg-red-50 border-red-200";
      case "BOOKING_UPDATED":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const handleDropdownToggle = (open: boolean) => {
    setIsOpen(open);
    if (open && tenantId) {
      // Refrescar notificaciones inmediatamente al abrir
      fetchNotifications();
      // Marcar todas las notificaciones como leídas al abrir el dropdown
      if (unreadCount > 0) {
        markAllAsRead();
      }
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleDropdownToggle}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-y-auto"
        sideOffset={8}
      >
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Notificaciones</h3>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No tienes notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-0 cursor-default ${!notification.read ? "bg-blue-50" : ""}`}
              >
                <div className={`w-full p-4 border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? "border-l-blue-500" : "border-l-transparent"}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      {notification.clientName && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <User className="w-3 h-3 mr-1" />
                          <span>{notification.clientName}</span>
                          {notification.serviceName && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{notification.serviceName}</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(notification.createdAt, { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </p>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 p-1 h-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setIsOpen(false);
                  // Navegar a una página de notificaciones completa si existe
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
