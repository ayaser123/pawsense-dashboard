import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Pet } from "@/hooks/usePets";

interface PetSelectorProps {
  pets: Pet[];
  selectedPet: Pet;
  onSelect: (pet: Pet) => void;
}

const petEmojis: Record<string, string> = {
  dog: "🐕",
  cat: "🐱",
  bird: "🐦",
  rabbit: "🐰",
  hamster: "🐹",
  other: "🦴",
};

export function PetSelector({ pets, selectedPet, onSelect }: PetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getMoodColor = (mood?: string) => {
    const colors: Record<string, string> = {
      happy: "bg-success/20 text-success border-success/30",
      calm: "bg-info/20 text-info border-info/30",
      anxious: "bg-warning/20 text-warning border-warning/30",
      sick: "bg-destructive/20 text-destructive border-destructive/30",
      playful: "bg-accent/20 text-accent-foreground border-accent/30",
    };
    return colors[mood || "happy"] || "bg-primary/20 text-primary border-primary/30";
  };

  const getPetEmoji = (pet: Pet) => {
    return pet.image_emoji || petEmojis[pet.species] || "🐾";
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full"
      >
        <Card variant="elevated" className="cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{getPetEmoji(selectedPet)}</div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    {selectedPet.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    {selectedPet.breed || "Mixed"} • {selectedPet.age || "?"} years old
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize hidden sm:inline`}>
                  {selectedPet.species}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 z-50"
        >
          <Card className="shadow-elevated overflow-hidden">
            {pets.map((pet) => (
              <motion.button
                key={pet.id}
                onClick={() => {
                  onSelect(pet);
                  setIsOpen(false);
                }}
                whileHover={{ backgroundColor: "hsl(var(--secondary))" }}
                className={`w-full p-4 flex items-center justify-between transition-colors ${
                  pet.id === selectedPet.id ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{getPetEmoji(pet)}</div>
                  <div className="text-left">
                    <h4 className="font-heading font-bold text-foreground">
                      {pet.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {pet.breed || "Mixed"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground capitalize">
                    {pet.species}
                  </span>
                  {pet.id === selectedPet.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </motion.button>
            ))}
          </Card>
        </motion.div>
      )}
    </div>
  );
}
