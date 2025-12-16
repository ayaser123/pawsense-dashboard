import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertsWindow, type AlertItem } from "@/components/dashboard/AlertsWindow";
import { motion, AnimatePresence } from "framer-motion";

interface AlertsWidgetProps {
  unreadCount: number;
  alerts: AlertItem[];
  onDismiss?: (id: string) => void;
  onClick?: (id: string) => void;
}

export function AlertsWidget({
  unreadCount,
  alerts,
  onDismiss,
  onClick,
}: AlertsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Alert Badge Button - Always show */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open alerts"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Alerts Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alerts ({unreadCount} unread)
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto pr-4">
            {alerts.length > 0 ? (
              <AlertsWindow
                alerts={alerts}
                maxVisible={100}
                onDismiss={(id) => {
                  onDismiss?.(id);
                }}
                onClick={(id) => {
                  onClick?.(id);
                }}
              />
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No unread alerts</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
