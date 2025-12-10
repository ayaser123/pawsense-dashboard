import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Video, PhoneCall, Calendar, Clock, User, X, CheckCircle } from "lucide-react";

export function TelehealthConnect() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <Card variant="elevated" className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-success">
            <Video className="h-5 w-5" />
            Telehealth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect with a licensed veterinarian instantly for advice and consultations.
          </p>

          <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
              <User className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-foreground text-sm">
                Dr. Sarah Mitchell
              </p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Available Now
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>15 min sessions</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>24/7 available</span>
            </div>
          </div>

          <Button
            variant="telehealth"
            className="w-full gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Video className="h-4 w-4" />
            Start Video Call
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-success" />
              Telehealth Session
            </DialogTitle>
            <DialogDescription>
              Connect with a veterinarian for a live consultation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!isConnected ? (
              <>
                <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center">
                  {isConnecting ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-center"
                    >
                      <PhoneCall className="h-12 w-12 text-success mx-auto mb-3" />
                      <p className="text-muted-foreground">Connecting...</p>
                    </motion.div>
                  ) : (
                    <div className="text-center">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Ready to connect</p>
                    </div>
                  )}
                </div>

                <Button
                  variant="telehealth"
                  className="w-full gap-2"
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <PhoneCall className="h-4 w-4" />
                      </motion.div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      Connect Now
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-video bg-gradient-to-br from-success/20 to-success/5 rounded-xl flex items-center justify-center border border-success/30"
                >
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                    <p className="font-heading font-bold text-foreground">Connected!</p>
                    <p className="text-sm text-muted-foreground">
                      Session with Dr. Sarah Mitchell
                    </p>
                  </div>
                </motion.div>

                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm text-muted-foreground">Live</span>
                  </div>
                  <span className="text-sm font-medium">00:00:12</span>
                </div>

                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={handleDisconnect}
                >
                  <X className="h-4 w-4" />
                  End Call
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
