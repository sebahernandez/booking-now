"use client";

import { useState, useEffect } from "react";
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
import { Copy, Eye } from "lucide-react";
interface TenantData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

export default function WidgetPage() {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [widgetSettings, setWidgetSettings] = useState({
    width: "400",
    height: "600",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/admin/tenants");
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
        if (data.length > 0) {
          setSelectedTenant(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  const generateIframeCode = () => {
    if (!selectedTenant) return "";

    const iframeUrl = `${baseUrl}/widget/${selectedTenant}`;

    return `<iframe 
  src="${iframeUrl}"
  width="${widgetSettings.width}"
  height="${widgetSettings.height}"
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
</iframe>`;
  };

  const generateJavaScriptCode = () => {
    if (!selectedTenant || !baseUrl) return "";

    return `<!-- BookingNow Widget -->
<div id="bookingnow-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${baseUrl}/widget/${selectedTenant}';
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
    if (!selectedTenant || !baseUrl) return;
    window.open(`${baseUrl}/widget/${selectedTenant}`, "_blank");
  };

  const selectedTenantData = tenants.find((t) => t.id === selectedTenant);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Widget de Reservas
        </h1>
        <p className="text-lg text-gray-600">
          Genera código embebible para que los clientes puedan reservar desde
          sus sitios web
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuración */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Configuración</span>
              </CardTitle>
              <CardDescription>
                Personaliza el widget según tus necesidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tenant">Cliente/Tenant</Label>
                <select
                  id="tenant"
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                {selectedTenantData && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p>
                      <strong>Email:</strong> {selectedTenantData.email}
                    </p>
                    {selectedTenantData.phone && (
                      <p>
                        <strong>Teléfono:</strong> {selectedTenantData.phone}
                      </p>
                    )}
                    <Badge
                      variant={
                        selectedTenantData.isActive ? "default" : "destructive"
                      }
                      className="mt-1"
                    >
                      {selectedTenantData.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
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
                  placeholder="100%, 800px, etc."
                />
              </div>

              <div>
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
                  placeholder="600px, 100vh, etc."
                />
              </div>

              <Button
                onClick={openPreview}
                className="w-full"
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Código Generado */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Código de Integración</CardTitle>
              <CardDescription>
                Copia y pega este código en tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="iframe" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="iframe">Iframe</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                </TabsList>

                <TabsContent value="iframe" className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4 relative">
                    <pre className="text-green-400 text-sm overflow-x-auto">
                      <code>{generateIframeCode()}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateIframeCode())}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Pros:</strong> Fácil de implementar
                    </p>
                    <p>
                      <strong>Contras:</strong> Menos personalizable
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="javascript" className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4 relative">
                    <pre className="text-green-400 text-sm overflow-x-auto">
                      <code>{generateJavaScriptCode()}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateJavaScriptCode())}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Pros:</strong> Más control y personalización
                    </p>
                    <p>
                      <strong>Contras:</strong> Requiere conocimientos básicos
                      de HTML
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📋 Instrucciones de uso:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Selecciona el cliente/tenant apropiado</li>
                  <li>2. Ajusta las dimensiones según tu sitio web</li>
                  <li>
                    3. Copia el código que prefieras (Iframe o JavaScript)
                  </li>
                  <li>4. Pégalo en tu sitio web donde quieras que aparezca</li>
                  <li>5. ¡Los clientes podrán reservar directamente!</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
