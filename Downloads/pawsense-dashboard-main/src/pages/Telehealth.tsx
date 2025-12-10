import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { samplePets } from "@/data/petData";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Settings,
  Maximize2,
  User,
  Clock,
  Calendar,
  Star,
  CheckCircle,
  Sparkles,
  Heart,
  FileText,
  Camera,
} from "lucide-react";

const availableDoctors = [
  { id: "1", name: "Dr. Sarah Mitchell", specialty: "General Practice", rating: 4.9, available: true, image: "👩‍⚕️" },
  { id: "2", name: "Dr. James Wilson", specialty: "Emergency Care", rating: 4.8, available: true, image: "👨‍⚕️" },
  { id: "3", name: "Dr. Emily Chen", specialty: "Dermatology", rating: 4.7, available: false, image: "👩‍⚕️" },
];

export default function Telehealth() {
  const [selectedDoctor, setSelectedDoctor] = useState(availableDoctors[0]);
  const [selectedPet, setSelectedPet] = useState(samplePets[0]);
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startCall = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsInCall(true);
      setCallDuration(0);
    }, 2000);
  };

  const endCall = () => {
    setIsInCall(false);
    setCallDuration(0);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {!isInCall && !isConnecting ? (
          <>
            {/* Hero Section */}
            <section className="relative py-12 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-info/10 via-background to-primary/5" />
              <div className="absolute top-20 left-20 w-72 h-72 bg-info/20 rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-info/10 text-info mb-4">
                    <Video className="h-4 w-4" />
                    <span className="text-sm font-medium">24/7 Virtual Care</span>
                  </div>
                  <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
                    Connect with a Vet
                    <br />
                    <span className="text-info">In Minutes</span>
                  </h1>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Get expert veterinary advice from the comfort of your home. Available 24/7 for consultations, follow-ups, and emergencies.
                  </p>
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left - Select Doctor */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                  >
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-info" />
                          Available Veterinarians
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {availableDoctors.map((doctor) => (
                          <motion.button
                            key={doctor.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedDoctor(doctor)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                              selectedDoctor.id === doctor.id
                                ? "border-info bg-info/5"
                                : "border-border/50 hover:border-info/50"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-4xl">{doctor.image}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-heading font-bold text-foreground">
                                    {doctor.name}
                                  </h3>
                                  {doctor.available && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-success/10 text-success flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                      Online
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-3 w-3 text-accent fill-accent" />
                                  <span className="text-sm font-medium">{doctor.rating}</span>
                                  <span className="text-xs text-muted-foreground">(230 reviews)</span>
                                </div>
                              </div>
                              {selectedDoctor.id === doctor.id && (
                                <CheckCircle className="h-5 w-5 text-info" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Right - Start Call */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card variant="elevated" className="sticky top-24">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Start Consultation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Select Pet</label>
                          <Select
                            value={selectedPet.id}
                            onValueChange={(v) => setSelectedPet(samplePets.find((p) => p.id === v) || samplePets[0])}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {samplePets.map((pet) => (
                                <SelectItem key={pet.id} value={pet.id}>
                                  {pet.image} {pet.name} - {pet.breed}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-4 bg-secondary/50 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">{selectedDoctor.image}</div>
                            <div>
                              <p className="font-heading font-bold text-foreground text-sm">
                                {selectedDoctor.name}
                              </p>
                              <p className="text-xs text-success flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                Available Now
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              ~15 min session
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Instant connect
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="telehealth"
                          size="lg"
                          className="w-full"
                          onClick={startCall}
                          disabled={!selectedDoctor.available}
                        >
                          <Video className="h-5 w-5 mr-2" />
                          Start Video Call
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          By starting a call, you agree to our Terms of Service
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
                >
                  {[
                    { icon: Video, label: "HD Video", desc: "Crystal clear calls" },
                    { icon: FileText, label: "Prescriptions", desc: "Digital delivery" },
                    { icon: Heart, label: "Follow-ups", desc: "Free within 48h" },
                    { icon: Camera, label: "Share Images", desc: "Show symptoms easily" },
                  ].map((feature, i) => (
                    <div key={i} className="p-4 bg-card rounded-xl border border-border/50 text-center">
                      <feature.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="font-heading font-bold text-foreground text-sm">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>
          </>
        ) : (
          /* Video Call Interface */
          <section className="h-[calc(100vh-5rem)] bg-foreground/95 relative overflow-hidden">
            {/* Main Video Area */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isConnecting ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-24 h-24 rounded-full bg-info/20 flex items-center justify-center mx-auto mb-4"
                  >
                    <Phone className="h-10 w-10 text-info" />
                  </motion.div>
                  <p className="text-primary-foreground font-heading text-xl">Connecting to {selectedDoctor.name}...</p>
                  <p className="text-primary-foreground/60 text-sm mt-2">Please wait</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full bg-gradient-to-br from-info/20 to-primary/20 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-8xl mb-4">{selectedDoctor.image}</div>
                    <p className="text-primary-foreground font-heading text-2xl">{selectedDoctor.name}</p>
                    <p className="text-primary-foreground/60">{selectedDoctor.specialty}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Self View */}
            {isInCall && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-24 right-4 w-40 h-28 bg-secondary rounded-xl shadow-elevated overflow-hidden"
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  {isVideoOn ? (
                    <div className="text-4xl">{selectedPet.image}</div>
                  ) : (
                    <VideoOff className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              </motion.div>
            )}

            {/* Call Info */}
            {isInCall && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-card/90 backdrop-blur-lg rounded-full flex items-center gap-3"
              >
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-medium">Live • {formatDuration(callDuration)}</span>
              </motion.div>
            )}

            {/* Controls */}
            {isInCall && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 bg-card/90 backdrop-blur-lg rounded-2xl"
              >
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="icon"
                  className="rounded-full h-12 w-12"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  variant={!isVideoOn ? "destructive" : "secondary"}
                  size="icon"
                  className="rounded-full h-12 w-12"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full h-14 w-14"
                  onClick={endCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full h-12 w-12"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full h-12 w-12"
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </section>
        )}
      </main>

      {!isInCall && !isConnecting && <Footer />}
    </div>
  );
}
