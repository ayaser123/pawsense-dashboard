import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin,
  Navigation,
  Phone,
  Star,
  Filter,
  Stethoscope,
  Clock,
  Search,
  Heart,
  Shield,
  Award,
  Calendar,
  ChevronRight,
  Locate,
  X,
  Loader,
} from "lucide-react";
import { getUserLocation, searchNearbyVets } from "@/services/locationAPI";
import type { Veterinarian } from "@/services/locationAPI";

const specialties = ["All Specialties", "General Practice", "Emergency Care", "Surgery", "Dental"];

export default function VetFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [selectedVet, setSelectedVet] = useState<Veterinarian | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Load vets on mount
  useEffect(() => {
    const loadVets = async () => {
      setIsLoading(true);
      try {
        const location = await getUserLocation();
        setUserLocation({ lat: location.latitude, lng: location.longitude });
        const nearbyVets = await searchNearbyVets(location.latitude, location.longitude, 15);
        setVets(nearbyVets);
      } catch (error) {
        console.error("Error loading vets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVets();
  }, []);

  const filteredVets = vets.filter((vet) => {
    const matchesSearch = vet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vet.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = specialty === "All Specialties" || vet.specialty === specialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-background to-primary/5" />
          <div className="absolute top-10 right-20 w-64 h-64 bg-success/20 rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success mb-4">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Find Trusted Care</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
                Find the Perfect Vet
                <br />
                <span className="text-success">Near You</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Connect with verified veterinarians in your area. Book appointments, read reviews, and get the best care for your pet.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-3xl mx-auto"
            >
              <Card variant="elevated" className="p-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 border-0 bg-secondary/50"
                    />
                  </div>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger className="w-full sm:w-48 h-12 border-0 bg-secondary/50">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="default" size="lg" className="h-12 px-8">
                    <Locate className="h-4 w-4 mr-2" />
                    Near Me
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Results Grid */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading nearby veterinarians...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    <span className="font-bold text-foreground">{filteredVets.length}</span> veterinarians found
                  </p>
                  <Select defaultValue="distance">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Nearest</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="available">Available Now</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVets.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-600">No veterinarians found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredVets.map((vet, index) => (
                      <motion.div
                        key={`${vet.lat}-${vet.lng}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          variant="elevated"
                          className={`cursor-pointer transition-all duration-300 ${
                            selectedVet?.lat === vet.lat && selectedVet?.lng === vet.lng ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setSelectedVet(vet)}
                        >
                          <CardContent className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                                  <Stethoscope className="h-7 w-7 text-success" />
                                </div>
                                <div>
                                  <h3 className="font-heading font-bold text-foreground">{vet.name}</h3>
                                  <p className="text-sm text-muted-foreground">{vet.specialty || "General Practice"}</p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                vet.open ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                              }`}>
                                {vet.open ? "Open" : "Closed"}
                              </span>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 mb-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="font-medium">{vet.rating?.toFixed(1) || "4.5"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{vet.distance}</span>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-2 mb-4">
                              <p className="text-sm text-muted-foreground">{vet.address}</p>
                              {vet.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-primary" />
                                  <a href={`tel:${vet.phone}`} className="text-primary hover:underline">
                                    {vet.phone}
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Button */}
                            <Button
                              onClick={() => setShowBooking(true)}
                              className="w-full"
                              variant="outline"
                              size="sm"
                            >
                              View Details
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Shield, label: "Verified Vets", value: "500+" },
                { icon: Award, label: "5-Star Reviews", value: "10K+" },
                { icon: Clock, label: "Avg Response", value: "< 1hr" },
                { icon: Heart, label: "Pets Helped", value: "50K+" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-card rounded-2xl shadow-soft"
                >
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && selectedVet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBooking(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl shadow-elevated max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-bold">Book Appointment</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowBooking(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl mb-6">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="font-heading font-bold text-foreground">{selectedVet.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVet.specialty}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select Pet</label>
                  <Select defaultValue="luna">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="luna">🐕 Luna</SelectItem>
                      <SelectItem value="whiskers">🐈 Whiskers</SelectItem>
                      <SelectItem value="max">🦮 Max</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Reason for Visit</label>
                  <Select defaultValue="checkup">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkup">Regular Checkup</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="illness">Illness/Injury</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Preferred Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM", "5:30 PM", "7:00 PM"].map((time) => (
                      <Button key={time} variant="outline" size="sm" className="text-xs">
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button variant="default" className="w-full" size="lg">
                Confirm Booking
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
