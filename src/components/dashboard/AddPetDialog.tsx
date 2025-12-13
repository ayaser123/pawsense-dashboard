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
import { Plus } from "lucide-react";
import { Pet, usePets } from "@/hooks/usePets";

interface AddPetDialogProps {
  onPetAdded?: (pet: Pet) => void;
}

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
  const { addPet, error } = usePets();

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
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Your Pet</DialogTitle>
          <DialogDescription>
            Tell us about your furry, feathered, or fluffy friend
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Pet Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Buddy"
              required
            />
          </div>

          <div>
            <Label htmlFor="species">Type of Pet *</Label>
            <Select
              value={formData.species}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  species: value as typeof formData.species,
                })
              }
            >
              <SelectTrigger id="species">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">🐕 Dog</SelectItem>
                <SelectItem value="cat">🐱 Cat</SelectItem>
                <SelectItem value="bird">🐦 Bird</SelectItem>
                <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
                <SelectItem value="hamster">🐹 Hamster</SelectItem>
                <SelectItem value="other">🦴 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="breed">Breed</Label>
            <Input
              id="breed"
              value={formData.breed}
              onChange={(e) =>
                setFormData({ ...formData, breed: e.target.value })
              }
              placeholder="e.g., Golden Retriever"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                placeholder="e.g., 3"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                placeholder="e.g., 25.5"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="color">Color/Markings</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              placeholder="e.g., Brown and white"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end pt-4">
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
      </DialogContent>
    </Dialog>
  );
}
