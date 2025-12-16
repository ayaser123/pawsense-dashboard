import { motion } from "framer-motion";
import { Dog, Sparkles } from "lucide-react";

export function AppLoadingScreen() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center z-50">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center gap-8 max-w-md"
      >
        {/* Logo area */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3"
        >
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="relative"
          >
            <motion.div
              variants={pulseVariants}
              animate="animate"
              className="absolute inset-0 bg-primary/20 rounded-full blur-lg"
            />
            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl">
              <Dog className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              PawSense
            </h1>
            <p className="text-xs text-muted-foreground font-medium tracking-wide">
              AI-Powered Pet Care
            </p>
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Initializing PawSense
          </p>
          <p className="text-xs text-muted-foreground">
            Getting everything ready for your pet...
          </p>
        </motion.div>

        {/* Animated loader bars */}
        <motion.div
          variants={itemVariants}
          className="flex gap-2 justify-center"
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-8 bg-gradient-to-t from-primary to-primary/40 rounded-full"
              animate={{
                scaleY: [1, 1.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>

        {/* Features preview */}
        <motion.div
          variants={itemVariants}
          className="w-full space-y-3"
        >
          {[
            { icon: Sparkles, text: "AI Analysis Ready" },
            { icon: Dog, text: "Pet Tracking Enabled" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
              >
                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-muted-foreground">
                  {item.text}
                </span>
                <motion.div
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Progress indicator */}
        <motion.div variants={itemVariants} className="w-full space-y-2">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Loading your experience...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
