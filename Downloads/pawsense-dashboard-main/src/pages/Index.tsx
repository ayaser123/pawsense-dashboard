import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  PawPrint,
  Brain,
  Activity,
  MapPin,
  Video,
  Moon,
  Volume2,
  ArrowRight,
  Sparkles,
  Heart,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Behavior Analysis",
    description: "Advanced machine learning analyzes your pet's body language and vocalizations.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Volume2,
    title: "Sound Translator",
    description: "Decode what your pet is trying to tell you with our AI sound analyzer.",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: MapPin,
    title: "Vet Finder",
    description: "Find trusted veterinarians near you with real-time availability.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Activity,
    title: "Activity Tracking",
    description: "Monitor your pet's daily activities with GPS-enabled tracking.",
    color: "bg-info/10 text-info",
  },
  {
    icon: Moon,
    title: "Sleep Analytics",
    description: "Understand your pet's sleep patterns and improve their rest quality.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Video,
    title: "Telehealth",
    description: "Connect with licensed vets instantly for advice and consultations.",
    color: "bg-success/10 text-success",
  },
];

const stats = [
  { value: "50K+", label: "Happy Pets" },
  { value: "99%", label: "Accuracy" },
  { value: "24/7", label: "Support" },
  { value: "500+", label: "Vet Partners" },
];

export default function Index() {
  const { isAuthenticated } = useAuth();
  const actionHref = isAuthenticated ? "/dashboard" : "/signup";
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">AI-Powered Pet Intelligence</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6"
              >
                Understand Your Pet
                <br />
                <span className="text-gradient">Like Never Before</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
              >
                PawSense uses advanced AI to analyze your pet's behavior, mood, and health.
                Get real-time insights and connect with veterinarians instantly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link to={actionHref}>
                  <Button variant="hero" size="xl" className="gap-2 group">
                    <PawPrint className="h-5 w-5" />
                    Start Analyzing
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="gap-2">
                  Watch Demo
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="font-heading text-3xl md:text-4xl font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything Your Pet Needs
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools designed to help you understand, care for, and connect with your beloved companion.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="elevated" className="h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Trusted by Pet Lovers Worldwide
                </h2>
                <p className="text-muted-foreground mb-8">
                  Join thousands of pet owners who trust PawSense to keep their furry friends happy and healthy. Our AI-powered platform provides accurate insights backed by veterinary science.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: Shield, text: "Veterinarian Approved" },
                    { icon: Zap, text: "Real-time Analysis" },
                    { icon: Heart, text: "Made with Love for Pets" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <Link to={actionHref} className="inline-block mt-8">
                  <Button variant="default" size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="text-9xl mb-4"
                    >
                      🐕
                    </motion.div>
                    <p className="font-heading text-xl font-bold text-foreground">
                      Your Best Friend Deserves the Best
                    </p>
                  </div>
                </div>

                {/* Floating Cards */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-4 -right-4 p-4 bg-card rounded-xl shadow-elevated border border-border/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Happy Mood</p>
                      <p className="text-xs text-muted-foreground">Detected</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 p-4 bg-card rounded-xl shadow-elevated border border-border/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">94%</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to Connect with Your Pet?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start using PawSense today and discover what your pet has been trying to tell you all along.
              </p>
              <Link to={actionHref}>
                <Button variant="hero" size="xl" className="gap-2">
                  <PawPrint className="h-5 w-5" />
                  Try PawSense Free
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
