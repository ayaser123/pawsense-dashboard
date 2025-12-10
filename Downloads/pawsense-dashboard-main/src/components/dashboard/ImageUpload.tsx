import { motion } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Sparkles, Camera } from "lucide-react";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideoPreview, setIsVideoPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
                  Drop your pet's video here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse • MP4, MOV up to 50MB
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                <Camera className="h-4 w-4 mr-2" />
                Select Video
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
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
                transition={{ delay: 0.3 }}
                className="absolute bottom-2 left-2 right-2 p-2 bg-card/90 backdrop-blur-sm rounded-lg"
              >
                <div className="flex flex-col gap-2">
                  {error && (
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  )}
                  {analysis && (
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-primary">✓ Analysis Complete</p>
                      <p className="text-xs text-muted-foreground">
                        Mood: <span className="font-semibold">{analysis.mood}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Activity: <span className="font-semibold">{analysis.activity_level}</span>
                      </p>
                    </div>
                  )}
                  {!analysis && (
                    <Button
                      size="sm"
                      onClick={handleAnalyze}
                      className="w-full"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Analyze with AI
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
