// Pet types and sample data for PawSense

export interface Pet {
  id: string;
  name: string;
  type: "dog" | "cat" | "bird" | "rabbit";
  breed: string;
  age: number;
  image: string;
  mood: "happy" | "calm" | "anxious" | "sick" | "playful";
  lastActivity: string;
}

export interface BehaviorPrediction {
  id: string;
  behavior: string;
  confidence: number;
  mood: string;
  timestamp: string;
  recommendation: string;
}

export interface SleepData {
  time: string;
  deepSleep: number;
  lightSleep: number;
  awake: number;
}

export interface ActivityPoint {
  lat: number;
  lng: number;
  activity: string;
  timestamp: string;
}

export interface VetLocation {
  id: string
  name: string
  address: string
  phone?: string
  lat: number
  lng: number
  specialty?: string
  distance?: string
  rating?: number
  reviews?: number
  isOpen?: boolean
  available?: boolean
}


// No default sample pets - users must add their own pets
export const samplePets: Pet[] = [];

export const samplePredictions: BehaviorPrediction[] = [
  {
    id: "1",
    behavior: "Tail wagging",
    confidence: 94,
    mood: "Happy & Excited",
    timestamp: "2 min ago",
    recommendation: "Great time for play or training!",
  },
  {
    id: "2",
    behavior: "Ear positioning",
    confidence: 87,
    mood: "Alert & Curious",
    timestamp: "5 min ago",
    recommendation: "Something caught their attention.",
  },
  {
    id: "3",
    behavior: "Body posture",
    confidence: 91,
    mood: "Relaxed",
    timestamp: "8 min ago",
    recommendation: "Comfortable and content.",
  },
  {
    id: "4",
    behavior: "Vocalization",
    confidence: 78,
    mood: "Seeking Attention",
    timestamp: "12 min ago",
    recommendation: "Consider some quality time.",
  },
];

export const sampleVets: VetLocation[] = [
  {
    id: "1",
    name: "PawCare Veterinary Clinic",
    specialty: "General Practice",
    rating: 4.8,
    distance: "0.5 mi",
    lat: 40.7138,
    lng: -74.0065,
    phone: "(555) 123-4567",
    address: "123 Pet Street, New York",
    available: true,
  },
  {
    id: "2",
    name: "Happy Tails Emergency",
    specialty: "Emergency Care",
    rating: 4.9,
    distance: "1.2 mi",
    lat: 40.7155,
    lng: -74.002,
    phone: "(555) 987-6543",
    address: "456 Animal Ave, New York",
    available: true,
  },
  {
    id: "3",
    name: "Whiskers & Paws Specialty",
    specialty: "Dermatology",
    rating: 4.7,
    distance: "1.8 mi",
    lat: 40.71,
    lng: -74.01,
    phone: "(555) 456-7890",
    address: "789 Vet Blvd, New York",
    available: false,
  },
];

export const moodColors = {
  happy: "hsl(var(--success))",
  calm: "hsl(var(--info))",
  anxious: "hsl(var(--warning))",
  sick: "hsl(var(--destructive))",
  playful: "hsl(var(--accent))",
};

export const moodIcons = {
  happy: "😊",
  calm: "😌",
  anxious: "😰",
  sick: "🤒",
  playful: "🎾",
};
