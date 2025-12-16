import { motion } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Sparkles, Camera, AlertCircle } from "lucide-react";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  petId?: string;
}

type AnalysisCategory = "behavior" | "health" | "nutrition" | "activity" | "safety" | "general";

const ANALYSIS_CATEGORIES: { value: AnalysisCategory; label: string; description: string }[] = [
  { value: "behavior", label: "Behavior Analysis", description: "Analyze pet behavior and mood" },
  { value: "health", label: "Health Check", description: "Look for signs of illness or injury" },
  { value: "nutrition", label: "Nutrition Assessment", description: "Evaluate body condition and diet" },
  { value: "activity", label: "Activity Level", description: "Assess exercise and energy levels" },
  { value: "safety", label: "Safety Check", description: "Check for hazards or unsafe situations" },
  { value: "general", label: "General Scan", description: "Overall comprehensive analysis" },
];

export function ImageUpload({ onImageSelect, petId }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideoPreview, setIsVideoPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AnalysisCategory>("general");

  const { uploadVideo, analysis, isUploading, isAnalyzing, uploadProgress, error } =
    useVideoAnalysis();

  const handleFile = useCallback((file: File) => {
    if (!file) return;

    // Video handling
    if (file.type.startsWith("video/")) {
      // Revoke previous object URL if present
      if (objectUrlRef.current) {
        try {
          URL.revokeObjectURL(objectUrlRef.current);
        } catch (e) {
          // ignore
        }
      }

      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreview(url);
      setIsVideoPreview(true);
      setSelectedFile(file);
      onImageSelect(file);
      return;
    }

    // Fallback: image handling (in case you want both)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
        setIsVideoPreview(false);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const clearPreview = () => {
    setPreview(null);
    setIsVideoPreview(false);
    setSelectedFile(null);
    if (objectUrlRef.current) {
      try {
        URL.revokeObjectURL(objectUrlRef.current);
      } catch (e) {
        // ignore
      }
      objectUrlRef.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    await uploadVideo(selectedFile);
  };

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Analyze Pet Behavior
        </CardTitle>
      </CardHeader>
      <CardContent>
        <input
          type="file"
          ref={fileInputRef}
          accept="video/*,image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        {!preview ? (
          <div className="space-y-4">
            <motion.div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              animate={{
                borderColor: isDragging ? "hsl(var(--primary))" : "hsl(var(--border))",
                backgroundColor: isDragging ? "hsl(var(--primary) / 0.05)" : "transparent",
              }}
              className="border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <motion.div
                  animate={{ y: isDragging ? -5 : 0 }}
                  className="p-4 rounded-full bg-primary/10"
                >
                  <Upload className="h-8 w-8 text-primary" />
                </motion.div>
                <div>
                  <p className="font-heading font-bold text-foreground">
                    Drop your pet's video or photo here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse • MP4, MOV, JPG, PNG up to 50MB
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  <Camera className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </div>
            </motion.div>

            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <p className="text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
                Analysis Categories
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ANALYSIS_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`text-left p-2 rounded-lg border transition-all ${
                      selectedCategory === cat.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-xs font-semibold text-foreground">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {isVideoPreview ? (
              <video
                src={preview as string}
                controls
                className="w-full h-48 object-cover rounded-xl bg-black"
              />
            ) : (
              <img
                src={preview as string}
                alt="Pet preview"
                className="w-full h-48 object-cover rounded-xl"
              />
            )}

            {/* Category Selection with Preview */}
            {!isUploading && !isAnalyzing && (
              <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-xs font-semibold text-accent mb-2 uppercase">
                  Analysis Focus
                </p>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as AnalysisCategory)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANALYSIS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span>{cat.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  {ANALYSIS_CATEGORIES.find((c) => c.value === selectedCategory)?.description}
                </p>
              </div>
            )}

            {(isUploading || isAnalyzing) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-8 w-8 text-primary" />
                  </motion.div>
                  <p className="font-heading font-bold text-primary">
                    {isUploading ? "Uploading..." : "Analyzing behavior..."}
                  </p>
                  {uploadProgress > 0 && (
                    <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearPreview}
              className="absolute top-2 right-2 p-2 rounded-full bg-card/90 backdrop-blur-sm shadow-soft hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </motion.button>

            {!isUploading && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2"
              >
                {error && (
                  <div className="flex-1 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}
                {analysis && (
                  <div className="flex-1 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-semibold text-primary mb-2">✓ Analysis Complete</p>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p>
                        Mood: <span className="font-semibold text-foreground">{analysis.mood}</span>
                      </p>
                      <p>
                        Activity: <span className="font-semibold text-foreground">{analysis.activity_level}</span>
                      </p>
                    </div>
                  </div>
                )}
                {!error && !analysis && (
                  <Button onClick={handleAnalyze} className="flex-1">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze with AI ({selectedCategory})
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
