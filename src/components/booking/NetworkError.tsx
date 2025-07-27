import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {isNetworkError ? "Error de Conexión" : "Error"}
            </h3>
            <p className="text-red-700 mb-4 text-sm leading-relaxed">{error}</p>

            {isNetworkError && (
              <div className="mb-4 p-3 bg-red-100 rounded-lg">
                <p className="text-xs text-red-600">
                  <strong>Sugerencias:</strong>
                </p>
                <ul className="text-xs text-red-600 mt-1 space-y-1">
                  <li>• Verifica tu conexión a internet</li>
                  <li>• Recarga la página</li>
                  <li>• Intenta nuevamente en unos momentos</li>
                </ul>
              </div>
            )}

            {onRetry && (
              <Button
                onClick={onRetry}
                disabled={loading}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
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
          </div>
        </div>
      </div>
    </div>
  );
}
