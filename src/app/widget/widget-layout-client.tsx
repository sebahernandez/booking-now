"use client";

import { useEffect, useState } from "react";

export function WidgetLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Configurar estilos específicos para iframe del lado del cliente
    if (typeof window !== "undefined") {
      // Detectar si está en iframe
      const isInIframe = window.self !== window.top;

      // Configurar estilos básicos
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.fontFamily = "'Inter', 'Inter Fallback'";

      if (isInIframe) {
        // Agregar clase para identificar que está en iframe
        document.body.classList.add("widget-iframe");

        // Agregar meta viewport si no existe
        if (!document.querySelector('meta[name="viewport"]')) {
          const viewport = document.createElement("meta");
          viewport.name = "viewport";
          viewport.content = "width=device-width, initial-scale=1";
          document.head.appendChild(viewport);
        }

        // Configurar X-Frame-Options
        if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
          const frameOptions = document.createElement("meta");
          frameOptions.httpEquiv = "X-Frame-Options";
          frameOptions.content = "SAMEORIGIN";
          document.head.appendChild(frameOptions);
        }

        // Agregar estilos CSS específicos para iframe
        const style = document.createElement("style");
        style.textContent = `
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Inter', 'Inter Fallback' !important;
          }
          
          /* Estilos para cuando está en iframe */
          @media (max-width: 768px) {
            .container {
              padding: 0.5rem;
            }
          }
          
          .widget-iframe {
            background: transparent;
          }
        `;
        document.head.appendChild(style);
      }

      // Configurar debugging si está habilitado
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("debug") === "true") {
        (
          window as unknown as { __BOOKING_WIDGET_DEBUG: unknown }
        ).__BOOKING_WIDGET_DEBUG = {
          environment: isInIframe ? "iframe" : "standalone",
          timestamp: Date.now(),
          sessionId: Math.random().toString(36).substr(2, 9),
          isClient: true,
          mounted: true,
        };

        console.log("🔧 Widget Debug Mode Activated");
      }
    }
  }, []);

  // Renderizar con protección de hidratación
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
