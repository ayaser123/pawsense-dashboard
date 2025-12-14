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
import { searchLocationByName } from "@/services/locationAPI";
import type { Veterinarian } from "@/services/locationAPI";

const specialties = ["All Specialties", "General Practice", "Emergency Care", "Surgery", "Dental"];

export default function VetFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [selectedVet, setSelectedVet] = useState<Veterinarian | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load vets on mount
  useEffect(() => {
    const loadVets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("🐾 VetFinder: Starting location detection...");
        const location = await getUserLocation();
        console.log("📍 VetFinder: Got location:", location);
        
        setUserLocation({ lat: location.latitude, lng: location.longitude });
        
        console.log("🔍 VetFinder: Searching for nearby vets...");
        const nearbyVets = await searchNearbyVets(location.latitude, location.longitude, 15);
        console.log("✅ VetFinder: Found vets:", nearbyVets);
        
        if (nearbyVets.length === 0) {
          setError("No veterinarians found in this area. Try adjusting your location or search radius.");
          console.warn("⚠️ No veterinarians found in database for this location");
        }
        
        setVets(nearbyVets);
      } catch (error) {
        console.warn("⚠️ VetFinder: Geolocation failed:", error);
        setError(
          error instanceof Error 
            ? error.message 
            : "Unable to get your location. Please search for your city to find nearby vets with accurate distances."
        );
        // Don't load vets without valid location - distances would be wrong
        setVets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadVets();
  }, []);

  // Handle location search
  const handleLocationSearch = async () => {
    if (!locationQuery.trim()) {
      setError("Please enter a location");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log(`🔍 Searching for vets in: ${locationQuery}`);
      const location = await searchLocationByName(locationQuery);
      
      if (!location) {
        setError(`Location "${locationQuery}" not found. Please try another search.`);
        setVets([]);
        return;
      }

      setUserLocation({ lat: location.latitude, lng: location.longitude });
      console.log(`📍 Location found:`, location);

      const nearbyVets = await searchNearbyVets(location.latitude, location.longitude, 15);
      console.log(`✅ Found ${nearbyVets.length} vets near ${locationQuery}`);

      if (nearbyVets.length === 0) {
        setError(`No veterinarians found near ${locationQuery}. Try searching a larger area or nearby city.`);
      }

      setVets(nearbyVets);
    } catch (err) {
      console.error("Error searching location:", err);
      setError("Error searching location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              className="max-w-4xl mx-auto"
            >
              <Card variant="elevated" className="p-2">
                <div className="flex flex-col gap-2">
                  {/* Location Search Row */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by city or address..."
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
                        className="pl-10 h-12 border-0 bg-secondary/50"
                      />
                    </div>
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="h-12 px-8"
                      onClick={handleLocationSearch}
                      disabled={isLoading}
                    >
                      {isLoading ? "Searching..." : "Search Location"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="h-12 px-8"
                      onClick={async () => {
                        setIsLoading(true);
                        setError(null);
                        try {
                          const location = await getUserLocation();
                          setUserLocation({ lat: location.latitude, lng: location.longitude });
                          const nearbyVets = await searchNearbyVets(location.latitude, location.longitude, 15);
                          setVets(nearbyVets);
                          if (nearbyVets.length === 0) {
                            setError("No veterinarians found near your location.");
                          }
                        } catch (err) {
                          setError("Error getting your location.");
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <Locate className="h-4 w-4 mr-2" />
                      Near Me
                    </Button>
                  </div>
                  
                  {/* Filter Row */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Filter results by vet name..."
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
                  </div>
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
            ) : error ? (
              <div className="py-12 text-center">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-2xl mx-auto">
                  <h3 className="font-semibold text-foreground mb-3">
                    {error.includes("location") ? "📍 Location Required" : "No Veterinarians Found"}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">{error}</p>
                  {error.includes("location") && (
                    <div className="bg-background rounded p-4 text-left text-sm text-muted-foreground space-y-3 mb-4">
                      <p><strong>✅ Quick Fix:</strong> Use the search bar above to enter your city or location name.</p>
                      <p className="text-xs"><strong>Example:</strong> Search for "Lahore", "Islamabad", "Karachi", or any city name to get accurate distances from your location.</p>
                      <p className="text-xs"><strong>📌 Note:</strong> This ensures all distance calculations are accurate from your actual location, not a default location.</p>
                    </div>
                  )}
                  {!error.includes("location") && (
                    <div className="bg-background rounded p-4 text-left text-xs text-muted-foreground space-y-3 mb-4">
                      <p><strong>📌 Note:</strong> PawSense uses real, verified data from OpenStreetMap - the world's largest open database of locations.</p>
                      <p><strong>🏥 Limited Coverage:</strong> Some regions may have incomplete veterinary clinic listings on OpenStreetMap.</p>
                      <p><strong>🤝 Help Improve:</strong> You can add missing veterinary clinics at <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openstreetmap.org</a></p>
                      <p><strong>💡 Tip:</strong> Try searching nearby cities or larger regions to find available vets.</p>
                    </div>
                  )}
                </div>
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
                          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            selectedVet?.lat === vet.lat && selectedVet?.lng === vet.lng ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => {
                            setSelectedVet(vet);
                            setShowDetails(true);
                          }}
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

      {/* Vet Details Modal with Map */}
      <AnimatePresence>
        {showDetails && selectedVet && userLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-card border-b p-6 flex items-center justify-between z-10">
                <h2 className="font-heading text-2xl font-bold text-foreground">Veterinary Details</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetails(false)}
                  className="h-8 w-8"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Header with name and rating */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="h-8 w-8 text-success" />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-foreground">{selectedVet.name}</h3>
                      <p className="text-muted-foreground mb-2">{selectedVet.specialty || "General Practice"}</p>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{selectedVet.rating?.toFixed(1) || "4.5"}</span>
                        <span className="text-sm text-muted-foreground">(128 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    selectedVet.open ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {selectedVet.open ? "Open Now" : "Closed"}
                  </span>
                </div>

                {/* Distance Information */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">Distance from you</p>
                          <p className="font-bold text-lg text-foreground">{selectedVet.distance}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Navigation className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">Your Location</p>
                          <p className="font-medium text-foreground">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Map Placeholder */}
                <div className="bg-muted rounded-xl overflow-hidden border">
                  <div className="w-full h-80 bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center relative">
                    <div className="text-center space-y-4">
                      <MapPin className="h-12 w-12 text-primary mx-auto opacity-50" />
                      <div>
                        <p className="font-semibold text-foreground">Vet Location: {selectedVet.lat.toFixed(4)}, {selectedVet.lng.toFixed(4)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Your Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Open in Google Maps to navigate →
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const mapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedVet.lat},${selectedVet.lng}`;
                          window.open(mapsUrl, "_blank");
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Contact Information</h4>
                  {selectedVet.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                      <a href={`tel:${selectedVet.phone}`} className="text-primary hover:underline">
                        {selectedVet.phone}
                      </a>
                    </div>
                  )}
                  {selectedVet.address && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Address</p>
                        <p className="text-sm text-muted-foreground">{selectedVet.address}</p>
                      </div>
                    </div>
                  )}
                  {selectedVet.website && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Award className="h-5 w-5 text-primary flex-shrink-0" />
                      <a href={selectedVet.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (selectedVet.phone) {
                        window.location.href = `tel:${selectedVet.phone}`;
                      }
                    }}
                    disabled={!selectedVet.phone}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setShowDetails(false);
                      setShowBooking(true);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
