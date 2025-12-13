import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BehaviorPrediction } from "@/data/petData";
import { Brain, TrendingUp, Clock, Lightbulb } from "lucide-react";

interface PredictionsTableProps {
  predictions: BehaviorPrediction[];
}

export function PredictionsTable({ predictions }: PredictionsTableProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success bg-success/10";
    if (confidence >= 75) return "text-info bg-info/10";
    return "text-warning bg-warning/10";
  };

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Behavior Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {predictions.map((prediction, index) => (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-heading font-bold text-foreground text-sm">
                    {prediction.behavior}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getConfidenceColor(prediction.confidence)}`}>
                  {prediction.confidence}%
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm mb-2">
                <span className="text-muted-foreground">
                  Mood: <span className="text-foreground font-medium">{prediction.mood}</span>
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {prediction.timestamp}
                </span>
              </div>

              <div className="flex items-start gap-2 mt-2 p-2 bg-accent/10 rounded-lg">
                <Lightbulb className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {prediction.recommendation}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
