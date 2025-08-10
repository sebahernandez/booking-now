import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

interface NetworkErrorProps {
  error: string;
  onRetry?: () => void;
  loading?: boolean;
}

export function NetworkError({
  error,
  onRetry,
  loading = false,
}: NetworkErrorProps) {
  const isNetworkError =
    error.includes("conexión") ||
    error.includes("Failed to fetch") ||
    error.includes("Tiempo de espera");

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <h3 className="font-semibold mb-2">
                {isNetworkError ? "Error de Conexión" : "Error"}
              </h3>
              <p className="text-sm leading-relaxed">{error}</p>
            </AlertDescription>
          </Alert>

          {isNetworkError && (
            <Alert className="mb-4">
              <AlertDescription>
                <p className="text-sm font-medium mb-2">Sugerencias:</p>
                <ul className="text-sm space-y-1">
                  <li>• Verifica tu conexión a internet</li>
                  <li>• Recarga la página</li>
                  <li>• Intenta nuevamente en unos momentos</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reintentando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
