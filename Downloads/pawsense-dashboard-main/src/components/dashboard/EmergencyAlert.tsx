import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pet } from "@/data/petData";
import { AlertTriangle, Navigation, Phone, MapPin } from "lucide-react";

interface EmergencyAlertProps {
  pet: Pet;
  nearestVet: {
    name: string;
    distance: string;
    phone: string;
    address: string;
    lat?: number | null;
    lng?: number | null;
  };
}

export function EmergencyAlert({ pet, nearestVet }: EmergencyAlertProps) {
  if (pet.mood !== "sick") return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-destructive/10 border-destructive/30 pulse-alert">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 animate-bounce-gentle" />
            Emergency Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground">
            <span className="font-bold">{pet.name}</span> is showing signs of illness.
            We recommend immediate veterinary attention.
          </p>

          <div className="p-3 bg-card rounded-xl border border-border/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <MapPin className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-foreground text-sm">
                  {nearestVet.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nearestVet.distance} away • {nearestVet.address}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="emergency"
              className="flex-1 gap-2"
              onClick={() => {
                if (nearestVet.lat && nearestVet.lng) {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${nearestVet.lat},${nearestVet.lng}`;
                  window.open(url, '_blank');
                } else {
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nearestVet.address)}`;
                  window.open(url, '_blank');
                }
              }}
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-destructive/30 hover:bg-destructive/10"
              onClick={() => {
                if (nearestVet.phone) window.location.href = `tel:${nearestVet.phone}`;
              }}
            >
              <Phone className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
