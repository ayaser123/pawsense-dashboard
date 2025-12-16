import { motion } from "framer-motion";

export function AppLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl"
        >
          🐾
        </motion.div>
        <div className="space-y-2">
          <p className="text-xl font-semibold text-foreground">PawSense</p>
          <p className="text-muted-foreground">Loading your experience...</p>
        </div>
        <div className="flex justify-center gap-1">
          <motion.div
            animate={{ height: [4, 16, 4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-1 bg-primary rounded-full"
          />
          <motion.div
            animate={{ height: [4, 16, 4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            className="w-1 bg-accent rounded-full"
          />
          <motion.div
            animate={{ height: [4, 16, 4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            className="w-1 bg-primary rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
