import { motion } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, AudioWaveform } from "lucide-react";

const translationResults = [
  { sound: "Bark (high pitch)", meaning: "Excited! Want to play! 🎾", emoji: "🐕" },
  { sound: "Whine", meaning: "Needs attention or uncomfortable 🥺", emoji: "😢" },
  { sound: "Growl (low)", meaning: "Warning - feels threatened ⚠️", emoji: "😠" },
  { sound: "Howl", meaning: "Communicating with others 🌙", emoji: "🌕" },
  { sound: "Purr", meaning: "Content and relaxed 😊", emoji: "😻" },
  { sound: "Meow (short)", meaning: "Greeting or request 👋", emoji: "🐱" },
];

export function SoundTranslator() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translation, setTranslation] = useState<typeof translationResults[0] | null>(null);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(20).fill(0.2));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  const updateWaveform = useCallback(() => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const levels = [];
      const sliceWidth = Math.floor(dataArray.length / 20);
      for (let i = 0; i < 20; i++) {
        const avg = dataArray.slice(i * sliceWidth, (i + 1) * sliceWidth)
          .reduce((a, b) => a + b, 0) / sliceWidth;
        levels.push(Math.max(0.1, avg / 255));
      }
      setAudioLevel(levels);
      animationRef.current = requestAnimationFrame(updateWaveform);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      setIsRecording(true);
      updateWaveform();

      // Simulate stopping after 3 seconds
      setTimeout(() => {
        stopRecording();
      }, 3000);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(new Array(20).fill(0.2));
    
    // Simulate processing
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const randomResult = translationResults[Math.floor(Math.random() * translationResults.length)];
      setTranslation(randomResult);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          AI Sound Translator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Waveform Visualization */}
        <div className="h-20 bg-secondary/50 rounded-xl flex items-center justify-center gap-1 px-4 overflow-hidden">
          {audioLevel.map((level, i) => (
            <motion.div
              key={i}
              animate={{ 
                scaleY: isRecording ? level : 0.2,
                opacity: isRecording ? 1 : 0.5,
              }}
              transition={{ duration: 0.1 }}
              className="w-1.5 bg-primary rounded-full"
              style={{ 
                height: "60%",
                transformOrigin: "center",
              }}
            />
          ))}
        </div>

        {/* Control Button */}
        <div className="flex justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              className="rounded-full h-16 w-16"
              disabled={isProcessing}
            >
            {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <AudioWaveform className="h-6 w-6" />
                </motion.div>
              ) : isRecording ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </motion.div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isProcessing
            ? "Analyzing pet sounds..."
            : isRecording
            ? "Listening... Make your pet vocalize!"
            : "Tap to start listening"}
        </p>

        {/* Translation Result */}
        {translation && !isRecording && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-primary/10 rounded-xl border border-primary/20"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{translation.emoji}</span>
              <div>
                <p className="font-heading font-bold text-foreground text-sm">
                  {translation.sound}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {translation.meaning}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
