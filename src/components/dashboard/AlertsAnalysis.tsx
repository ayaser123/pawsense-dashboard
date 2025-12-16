import { useState, useMemo } from "react";
import { AlertCircle, TrendingUp, BarChart3, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { Alert } from "@/services/alertsService";

interface AlertsAnalysisProps {
  allAlerts: Alert[];
}

export function AlertsAnalysis({ allAlerts }: AlertsAnalysisProps) {
  const pastAlerts = useMemo(() => allAlerts.filter((a) => a.read), [allAlerts]);

  const stats = useMemo(() => {
    const total = pastAlerts.length;
    const byType = {
      critical: pastAlerts.filter((a) => a.type === "critical").length,
      warning: pastAlerts.filter((a) => a.type === "warning").length,
      success: pastAlerts.filter((a) => a.type === "success").length,
      info: pastAlerts.filter((a) => a.type === "info").length,
    };

    const bySource = {
      analysis: pastAlerts.filter((a) => a.source === "analysis").length,
      manual: pastAlerts.filter((a) => a.source === "manual").length,
      system: pastAlerts.filter((a) => a.source === "system").length,
    };

    return { total, byType, bySource };
  }, [pastAlerts]);

  const getAlertTypeColor = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "analysis":
        return "📹";
      case "manual":
        return "✏️";
      case "system":
        return "⚙️";
      default:
        return "📋";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Alerts</p>
                  <p className="text-3xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Critical</p>
                  <p className="text-3xl font-bold mt-2 text-red-600">{stats.byType.critical}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Warnings</p>
                  <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.byType.warning}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Success</p>
                  <p className="text-3xl font-bold mt-2 text-green-600">{stats.byType.success}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alert Sources Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Alert Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Video Analysis", count: stats.bySource.analysis, icon: "📹", color: "bg-blue-50" },
                { label: "Manual", count: stats.bySource.manual, icon: "✏️", color: "bg-purple-50" },
                { label: "System", count: stats.bySource.system, icon: "⚙️", color: "bg-gray-50" },
              ].map((source) => (
                <div key={source.label} className={`flex items-center justify-between p-3 rounded-lg ${source.color}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{source.icon}</span>
                    <span className="font-medium">{source.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{source.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Past Alerts History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Alert History
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Showing {pastAlerts.length} resolved alerts</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pastAlerts.length > 0 ? (
                pastAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border-2 ${getAlertTypeColor(alert.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{getSourceIcon(alert.source)}</span>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <span className="text-xs px-2 py-1 bg-black/10 rounded-full">
                            {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                        <p className="text-xs mt-2 opacity-75">
                          🐾 {alert.pet.name} • {alert.timestamp}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No resolved alerts yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
