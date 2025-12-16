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

const petIcons = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  hamster: Rat,
  other: Bone,
};

const petEmojis = {
  dog: "🐕",
  cat: "🐱",
  bird: "🐦",
  rabbit: "🐰",
  hamster: "🐹",
  other: "🦴",
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
    weight: "",
    color: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    setLocalError(null);
    const newPet = await addPet({
      name: formData.name,
      species: formData.species,
      breed: formData.breed || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      color: formData.color || undefined,
      image_emoji: petEmojis[formData.species],
    });

    if (newPet) {
      setFormData({
        name: "",
        species: "dog",
        breed: "",
        age: "",
        weight: "",
        color: "",
      });
      setOpen(false);
      onPetAdded?.(newPet);
    } else {
      setLocalError("Failed to add pet. Please try again.");
    }
    setLoading(false);
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

      {/* Overlay */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        />
      )}

      {/* Slide-in Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: open ? 0 : "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 shadow-lg overflow-y-auto"
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Add Your Pet</h2>
            <p className="text-xs text-muted-foreground">
              Tell us about your furry, feathered, or fluffy friend
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pb-20">
          <div>
            <Label htmlFor="name" className="text-xs">Pet Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Buddy"
              className="h-8 text-sm"
              required
            />
          </div>

          <div>
            <Label htmlFor="species" className="text-xs">Type of Pet *</Label>
            <Select
              value={formData.species}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  species: value as typeof formData.species,
                })
              }
            >
              <SelectTrigger id="species" className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
          </div>

          <div>
            <Label htmlFor="breed" className="text-xs">Breed</Label>
            <Input
              id="breed"
              value={formData.breed}
              onChange={(e) =>
                setFormData({ ...formData, breed: e.target.value })
              }
              placeholder="e.g., Golden Retriever"
              className="h-8 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="age" className="text-xs">Age (years)</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                placeholder="e.g., 3"
                className="h-8 text-sm"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                placeholder="e.g., 25.5"
                className="h-8 text-sm"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="color" className="text-xs">Color/Markings</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              placeholder="e.g., Brown and white"
              className="h-8 text-sm"
            />
          </div>

          {localError && (
            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
              {localError}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name}>
              {loading ? "Adding..." : "Add Pet"}
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
