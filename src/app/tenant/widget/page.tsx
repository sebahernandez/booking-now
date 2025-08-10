"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, Code, Globe } from "lucide-react";

export default function TenantWidgetPage() {
  const { data: session } = useSession();
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [widgetSettings, setWidgetSettings] = useState({
    width: "400",
    height: "600",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const generateIframeCode = () => {
    if (!session?.user?.tenantId || !baseUrl) return "";

    const iframeUrl = `${baseUrl}/widget/${session.user.tenantId}`;

    return `<iframe 
  src="${iframeUrl}"
  width="${widgetSettings.width}"
  height="${widgetSettings.height}"
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
</iframe>`;
  };

  const generateJavaScriptCode = () => {
    if (!session?.user?.tenantId || !baseUrl) return "";

    return `<!-- BookingNow Widget -->
<div id="bookingnow-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${baseUrl}/widget/${session.user.tenantId}';
    iframe.width = '${widgetSettings.width}';
    iframe.height = '${widgetSettings.height}';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    var container = document.getElementById('bookingnow-widget');
    if (container) {
      container.appendChild(iframe);
    }
  })();
</script>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("¡Código copiado al portapapeles!");
    });
  };

  const openPreview = () => {
    if (!session?.user?.tenantId || !baseUrl) return;
    window.open(`${baseUrl}/widget/${session.user.tenantId}`, "_blank");
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Widget de Reservas
        </h1>
        <p className="text-lg text-muted-foreground">
          Integra el sistema de reservas en tu sitio web con un simple código
        </p>
      </div>

      {/* Vista Previa del Widget */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">Vista Previa</CardTitle>
              <CardDescription className="text-muted-foreground">
                Así se verá tu widget de reservas
              </CardDescription>
            </div>
            <Button onClick={openPreview} variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Abrir en Nueva Ventana
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="bg-background rounded-lg shadow-lg overflow-hidden border">
              <iframe
                src={`${baseUrl}/widget/${session?.user?.tenantId}`}
                width={widgetSettings.width}
                height="400"
                className="w-full"
                style={{ border: "none" }}
                title="Vista previa del widget"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración del Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Configuración del Widget</CardTitle>
          <CardDescription className="text-muted-foreground">
            Personaliza las dimensiones de tu widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="width">Ancho</Label>
              <Input
                id="width"
                value={widgetSettings.width}
                onChange={(e) =>
                  setWidgetSettings((prev) => ({
                    ...prev,
                    width: e.target.value,
                  }))
                }
                placeholder="400px o 100%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Alto</Label>
              <Input
                id="height"
                value={widgetSettings.height}
                onChange={(e) =>
                  setWidgetSettings((prev) => ({
                    ...prev,
                    height: e.target.value,
                  }))
                }
                placeholder="600px"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Códigos de Integración */}
      <Tabs defaultValue="iframe" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="iframe" className="gap-2">
            <Code className="h-4 w-4" />
            Código iframe
          </TabsTrigger>
          <TabsTrigger value="javascript" className="gap-2">
            <Globe className="h-4 w-4" />
            Código JavaScript
          </TabsTrigger>
        </TabsList>

        <TabsContent value="iframe">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Código iframe</CardTitle>
              <CardDescription className="text-muted-foreground">
                Copia y pega este código directamente en tu HTML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-950 dark:bg-slate-900 text-slate-100 dark:text-slate-200 p-4 rounded-lg overflow-auto border">
                  <pre className="text-sm">
                    <code>{generateIframeCode()}</code>
                  </pre>
                </div>
                <Button
                  onClick={() => copyToClipboard(generateIframeCode())}
                  className="w-full gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Código iframe
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="javascript">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Código JavaScript</CardTitle>
              <CardDescription className="text-muted-foreground">
                Para una integración más dinámica en tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-950 dark:bg-slate-900 text-slate-100 dark:text-slate-200 p-4 rounded-lg overflow-auto border">
                  <pre className="text-sm">
                    <code>{generateJavaScriptCode()}</code>
                  </pre>
                </div>
                <Button
                  onClick={() => copyToClipboard(generateJavaScriptCode())}
                  className="w-full gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Código JavaScript
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Información Importante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge variant="secondary">Tip</Badge>
              <div>
                <p className="text-sm text-foreground">
                  <strong>Responsivo:</strong> El widget se adapta
                  automáticamente a diferentes tamaños de pantalla.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="secondary">Tip</Badge>
              <div>
                <p className="text-sm text-foreground">
                  <strong>Seguridad:</strong> El widget funciona de forma segura
                  desde cualquier dominio.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="secondary">Tip</Badge>
              <div>
                <p className="text-sm text-foreground">
                  <strong>Personalización:</strong> Los estilos se mantienen
                  consistentes con tu marca.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
