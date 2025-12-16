import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { samplePets, Pet } from "@/data/petData";
import { loadAlerts, markAlertAsRead, deleteAlert, type Alert } from "@/services/alertsService";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  X,
} from "lucide-react";

interface Alert {
  id: string;
  type: "warning" | "info" | "success" | "critical";
  title: string;
  message: string;
  pet: Pet;
  timestamp: string;
  read: boolean;
  action?: string;
}

// No sample alerts - only use alerts from actual video analysis
const sampleAlerts: Alert[] = [];

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Load alerts from localStorage on mount
  useEffect(() => {
    const loadedAlerts = loadAlerts();
    // Use loaded alerts if available, otherwise use sample alerts
    setAlerts(loadedAlerts.length > 0 ? loadedAlerts : sampleAlerts);
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalCount = alerts.filter((a) => a.type === "critical").length;

  const markAsRead = (id: string) => {
    const updated = markAlertAsRead(id);
    setAlerts(updated);
  };

  const dismissAlert = (id: string) => {
    const updated = deleteAlert(id);
    setAlerts(updated);
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <Bell className="h-5 w-5 text-warning" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <Bell className="h-5 w-5 text-info" />;
    }
  };

  const getAlertStyles = (type: Alert["type"], read: boolean) => {
    const base = read ? "opacity-70" : "";
    switch (type) {
      case "critical":
        return `${base} border-l-4 border-l-destructive bg-destructive/5`;
      case "warning":
        return `${base} border-l-4 border-l-warning bg-warning/5`;
      case "success":
        return `${base} border-l-4 border-l-success bg-success/5`;
      default:
        return `${base} border-l-4 border-l-info bg-info/5`;
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !a.read;
    if (activeTab === "critical") return a.type === "critical" || a.type === "warning";
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-background to-warning/5" />
          <div className="absolute top-10 right-20 w-64 h-64 bg-destructive/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-warning/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive mb-4">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Health Monitoring</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
                Pet Health
                <br />
                <span className="text-destructive">Alerts & Insights</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stay informed about your pet's health with real-time alerts, reminders, and actionable insights.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8"
            >
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
                  <p className="font-heading text-2xl font-bold text-destructive">{criticalCount}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </CardContent>
              </Card>
              <Card className="bg-warning/10 border-warning/20">
                <CardContent className="p-4 text-center">
                  <Bell className="h-6 w-6 text-warning mx-auto mb-2" />
                  <p className="font-heading text-2xl font-bold text-warning">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground">Unread</p>
                </CardContent>
              </Card>
              <Card className="bg-success/10 border-success/20">
                <CardContent className="p-4 text-center">
                  <Shield className="h-6 w-6 text-success mx-auto mb-2" />
                  <p className="font-heading text-2xl font-bold text-success">3</p>
                  <p className="text-xs text-muted-foreground">Pets Healthy</p>
                </CardContent>
              </Card>
              <Card className="bg-info/10 border-info/20">
                <CardContent className="p-4 text-center">
                  <Zap className="h-6 w-6 text-info mx-auto mb-2" />
                  <p className="font-heading text-2xl font-bold text-info">24/7</p>
                  <p className="text-xs text-muted-foreground">Monitoring</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Alerts List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card variant="elevated">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Notifications
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setAlerts(alerts.map((a) => ({ ...a, read: true })))}>
                      Mark all read
                    </Button>
                  </div>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                      <TabsTrigger value="unread" className="flex-1">
                        Unread
                        {unreadCount > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-destructive/20 text-destructive rounded-full text-xs">
                            {unreadCount}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="critical" className="flex-1">Critical</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="pt-4">
                  <AnimatePresence mode="popLayout">
                    {filteredAlerts.length > 0 ? (
                      <div className="space-y-3">
                        {filteredAlerts.map((alert, index) => (
                          <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl ${getAlertStyles(alert.type, alert.read)}`}
                            onClick={() => markAsRead(alert.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-heading font-bold text-foreground text-sm">
                                      {alert.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {alert.message}
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dismissAlert(alert.id);
                                    }}
                                    className="p-1 hover:bg-secondary rounded transition-colors"
                                  >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="text-lg">{alert.pet.image}</span>
                                    <span>{alert.pet.name}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {alert.timestamp}
                                  </span>
                                  {alert.action && (
                                    <Button variant="outline" size="sm" className="ml-auto text-xs h-7">
                                      {alert.action}
                                      <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                        <p className="font-heading font-bold text-foreground">All caught up!</p>
                        <p className="text-sm text-muted-foreground">No alerts to show</p>
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
