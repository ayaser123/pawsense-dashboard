import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Dog, Cat, Bird, Rabbit, Rat, Bone, X } from "lucide-react";
import { Pet, usePets } from "@/hooks/usePets";

interface AddPetDialogProps {
  onPetAdded?: (pet: Pet) => void;
}

interface PetPayload {
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'other';
  breed?: string;
  age?: number;
  gender?: string;
}

const petIcons = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  hamster: Rat,
  other: Bone,
};

export function AddPetDialog({ onPetAdded }: AddPetDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { addPet } = usePets();

  const [formData, setFormData] = useState({
    name: "",
    species: "dog" as const,
    breed: "",
    age: "",
    gender: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      console.log("[FORM] Pet name is empty, aborting");
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      const petPayload: PetPayload = {
        name: formData.name,
        species: formData.species,
      };
      
      if (formData.breed) petPayload.breed = formData.breed;
      if (formData.age) petPayload.age = parseInt(formData.age);
      if (formData.gender) petPayload.gender = formData.gender;

      console.log("[FORM] Form data:", formData);
      console.log("[FORM] Pet payload being sent:", petPayload);
      const newPet = await addPet(petPayload);

      if (newPet) {
        console.log("Pet added successfully:", newPet);
        setFormData({
          name: "",
          species: "dog",
          breed: "",
          age: "",
          gender: "",
        });
        setOpen(false);
        onPetAdded?.(newPet);
      } else {
        console.error("addPet returned null");
        setLocalError("Failed to add pet. Please try again.");
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setLocalError(err instanceof Error ? err.message : "Failed to add pet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 hover:border-primary/60 transition-colors cursor-pointer bg-primary/5 hover:bg-primary/10">
          <div className="flex flex-col items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            <p className="text-sm font-medium text-primary">Add New Pet</p>
          </div>
        </div>
      </motion.button>

      {/* Centered Modal with Overlay */}
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Centered Modal Dialog */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-gradient-to-br from-background via-background to-primary/5 border border-primary/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 px-6 py-5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐾</span>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Add Your Pet
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tell us about your furry, feathered, or fluffy friend
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </motion.button>
              </div>

              {/* Form Container */}
              <form onSubmit={handleSubmit} className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Pet Name Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor="name" className="text-xs font-semibold text-primary">
              Pet Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Buddy"
              className="h-10 text-sm border-primary/20 focus:border-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg mt-1.5"
              required
            />
          </motion.div>

          {/* Pet Type Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Label htmlFor="species" className="text-xs font-semibold text-primary">
              Type of Pet *
            </Label>
            <Select
              value={formData.species}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  species: value as typeof formData.species,
                })
              }
            >
              <SelectTrigger
                id="species"
                className="h-10 text-sm border-primary/20 focus:border-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg mt-1.5"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="dog">
                  <span className="flex items-center gap-2">
                    <Dog className="h-4 w-4" /> Dog
                  </span>
                </SelectItem>
                <SelectItem value="cat">
                  <span className="flex items-center gap-2">
                    <Cat className="h-4 w-4" /> Cat
                  </span>
                </SelectItem>
                <SelectItem value="bird">
                  <span className="flex items-center gap-2">
                    <Bird className="h-4 w-4" /> Bird
                  </span>
                </SelectItem>
                <SelectItem value="rabbit">
                  <span className="flex items-center gap-2">
                    <Rabbit className="h-4 w-4" /> Rabbit
                  </span>
                </SelectItem>
                <SelectItem value="hamster">
                  <span className="flex items-center gap-2">
                    <Rat className="h-4 w-4" /> Hamster
                  </span>
                </SelectItem>
                <SelectItem value="other">
                  <span className="flex items-center gap-2">
                    <Bone className="h-4 w-4" /> Other
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Breed Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="breed" className="text-xs font-semibold text-primary">
              Breed
            </Label>
            <Input
              id="breed"
              value={formData.breed}
              onChange={(e) =>
                setFormData({ ...formData, breed: e.target.value })
              }
              placeholder="e.g., Golden Retriever"
              className="h-10 text-sm border-primary/20 focus:border-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg mt-1.5"
            />
          </motion.div>

          {/* Age and Gender */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <Label htmlFor="age" className="text-xs font-semibold text-primary">
                Age (years)
              </Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                placeholder="e.g., 3"
                className="h-10 text-sm border-primary/20 focus:border-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg mt-1.5"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="gender" className="text-xs font-semibold text-primary">
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    gender: value,
                  })
                }
              >
                <SelectTrigger
                  id="gender"
                  className="h-10 text-sm border-primary/20 focus:border-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg mt-1.5"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Error Message */}

          {localError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center gap-2"
            >
              <span>⚠️</span>
              {localError}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 pt-4 border-t border-primary/10"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border-primary/20 hover:bg-primary/5"
            >
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                type="submit"
                disabled={loading || !formData.name}
                className="w-full rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? "Adding..." : "Add Pet"}
              </Button>
            </motion.div>
              </motion.div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
