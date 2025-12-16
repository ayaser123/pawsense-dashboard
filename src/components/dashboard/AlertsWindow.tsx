import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface AlertItem {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  action?: string;
  dismissible?: boolean;
}

interface AlertsWindowProps {
  alerts: AlertItem[];
  onDismiss?: (id: string) => void;
  maxVisible?: number;
}

export function AlertsWindow({ alerts, onDismiss, maxVisible = 3 }: AlertsWindowProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts
    .filter((a) => !dismissed.has(a.id))
    .slice(0, maxVisible);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    onDismiss?.(id);
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  const getIcon = (type: AlertItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertClass = (type: AlertItem["type"]) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "info":
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className="space-y-3 w-full">
      {visibleAlerts.map((alert) => (
        <Alert key={alert.id} className={`relative ${getAlertClass(alert.type)}`}>
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(alert.type)}</div>

            <div className="flex-1 min-w-0">
              <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
              <AlertDescription className="text-sm mt-1">{alert.message}</AlertDescription>

              {alert.action && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs h-7"
                  onClick={() => {
                    console.log(`Alert action: ${alert.action}`);
                  }}
                >
                  {alert.action}
                </Button>
              )}
            </div>

            {alert.dismissible !== false && (
              <button
                onClick={() => handleDismiss(alert.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </Alert>
      ))}

      {alerts.length > maxVisible && (
        <p className="text-xs text-gray-500">
          {alerts.length - maxVisible} more alert{alerts.length - maxVisible !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
