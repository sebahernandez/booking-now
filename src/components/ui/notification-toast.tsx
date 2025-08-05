"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Bell, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

interface NotificationToastProps {
  tenantId?: string;
}

interface ToastNotification extends Notification {
  isVisible: boolean;
  timeoutId?: NodeJS.Timeout;
}

export function NotificationToast({ tenantId }: NotificationToastProps) {
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());

  const hideToast = (notificationId: string) => {
    setToastNotifications(prev => 
      prev.map(toast => 
        toast.id === notificationId 
          ? { ...toast, isVisible: false }
          : toast
      )
    );

    // Remover completamente después de la animación
    setTimeout(() => {
      setToastNotifications(prev => {
        const toastToRemove = prev.find(toast => toast.id === notificationId);
        if (toastToRemove?.timeoutId) {
          clearTimeout(toastToRemove?.timeoutId);
        }
        return prev.filter(toast => toast.id !== notificationId);
      });
    }, 300);
  };

  const showToastNotifications = useCallback((notifications: Notification[]) => {
    notifications.forEach((notification, index) => {
      const delay = index * 1000; // Espaciar las notificaciones por 1 segundo
      
      setTimeout(() => {
        const toastNotification: ToastNotification = {
          ...notification,
          isVisible: true,
          createdAt: new Date(notification.createdAt)
        };

        setToastNotifications(prev => [...prev, toastNotification]);
        
        // Marcar como mostrada
        setShownNotifications(prev => {
          const newSet = new Set(prev);
          newSet.add(notification.id);
          // Guardar en localStorage
          localStorage.setItem(`shownNotifications_${tenantId}`, JSON.stringify([...newSet]));
          return newSet;
        });

        // Auto-ocultar después de 8 segundos
        const timeoutId = setTimeout(() => {
          hideToast(notification.id);
        }, 8000);

        // Actualizar con el timeoutId
        setToastNotifications(prev => 
          prev.map(toast => 
            toast.id === notification.id 
              ? { ...toast, timeoutId }
              : toast
          )
        );
      }, delay);
    });
  }, [tenantId]);

  const fetchAndShowNewNotifications = useCallback(async () => {
    if (!tenantId) return;

    try {
      const response = await fetch('/api/tenant/notifications?limit=5');
      if (response.ok) {
        const notifications: Notification[] = await response.json();
        
        // Filtrar solo las notificaciones nuevas que no hemos mostrado
        const newNotifications = notifications.filter(notification => 
          !shownNotifications.has(notification.id) && 
          !notification.read &&
          // Solo mostrar notificaciones de los últimos 5 minutos
          new Date().getTime() - new Date(notification.createdAt).getTime() < 5 * 60 * 1000
        );

        if (newNotifications.length > 0) {
          showToastNotifications(newNotifications);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications for toast:", error);
    }
  }, [tenantId, shownNotifications, showToastNotifications]);

  useEffect(() => {
    if (!tenantId) return;

    // Cargar notificaciones ya mostradas desde localStorage
    const stored = localStorage.getItem(`shownNotifications_${tenantId}`);
    if (stored) {
      setShownNotifications(new Set(JSON.parse(stored)));
    }

    // Escuchar eventos de nuevas notificaciones
    const handleNewNotification = async () => {
      await fetchAndShowNewNotifications();
    };

    window.addEventListener('newNotification', handleNewNotification);
    
    // Verificar notificaciones al cargar
    fetchAndShowNewNotifications();

    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
    };
  }, [tenantId, fetchAndShowNewNotifications]);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "NEW_BOOKING":
        return <Calendar className="w-5 h-5 text-green-600" />;
      case "BOOKING_CANCELLED":
        return <X className="w-5 h-5 text-red-600" />;
      case "BOOKING_UPDATED":
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "NEW_BOOKING":
        return "border-l-green-500 bg-green-50";
      case "BOOKING_CANCELLED":
        return "border-l-red-500 bg-red-50";
      case "BOOKING_UPDATED":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  if (toastNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toastNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            pointer-events-auto max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 
            ${getNotificationColor(notification.type)}
            transform transition-all duration-300 ease-in-out
            ${notification.isVisible 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0'
            }
          `}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {formatDistanceToNow(notification.createdAt, { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              </div>
              
              <div className="ml-4 flex-shrink-0 flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 hover:bg-gray-100"
                  onClick={() => hideToast(notification.id)}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}