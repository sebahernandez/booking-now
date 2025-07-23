import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Widget de Reservas - BookingNow",
  description: "Sistema de reservas embebible para sitios web",
};

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Permitir que el iframe funcione correctamente */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        {/* Estilos específicos para iframe */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body {
              margin: 0;
              padding: 0;
              font-family: ${inter.style.fontFamily};
            }
            /* Estilos para cuando está en iframe */
            @media (max-width: 768px) {
              .container {
                padding: 0.5rem;
              }
            }
          `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
