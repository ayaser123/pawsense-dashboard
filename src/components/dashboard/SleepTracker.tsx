"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun, TrendingUp } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface SleepTrackerProps {
  data: Array<{
    time: string
    deepSleep: number
    lightSleep: number
    awake: number
  }>
  sleepQuality?: string
  totalSleep?: number
}

export function SleepTracker({ data, sleepQuality = "Good", totalSleep = 8.2 }: SleepTrackerProps) {
  const actualQuality =
    data.length > 0
      ? data.reduce((acc, d) => acc + d.deepSleep, 0) / data.length > 60
        ? "Excellent"
        : data.reduce((acc, d) => acc + d.deepSleep, 0) / data.length > 40
          ? "Good"
          : "Fair"
      : sleepQuality

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            Sleep Tracker
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Quality:</span>
            <span
              className={`font-heading font-bold ${
                actualQuality === "Excellent" ? "text-success" : actualQuality === "Good" ? "text-info" : "text-warning"
              }`}
            >
              {actualQuality}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.length > 0 ? data : [{ time: "No data", deepSleep: 0, lightSleep: 0, awake: 100 }]}>
              {/* ... existing gradients and chart config ... */}
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-elevated)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
              />
              <Area
                type="monotone"
                dataKey="deepSleep"
                stroke="hsl(264, 54%, 71%)"
                strokeWidth={2}
                fill="url(#deepSleepGradient)"
                name="Deep Sleep"
              />
              <Area
                type="monotone"
                dataKey="lightSleep"
                stroke="hsl(200, 80%, 55%)"
                strokeWidth={2}
                fill="url(#lightSleepGradient)"
                name="Light Sleep"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Deep Sleep</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-info" />
            <span className="text-sm text-muted-foreground">Light Sleep</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mt-4"
        >
          <div className="p-3 bg-secondary/50 rounded-lg text-center">
            <Moon className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="font-heading font-bold text-foreground">{totalSleep.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">Total Sleep</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-success mb-1" />
            <p className="font-heading font-bold text-foreground">+12%</p>
            <p className="text-xs text-muted-foreground">vs Last Week</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg text-center">
            <Sun className="h-4 w-4 mx-auto text-accent mb-1" />
            <p className="font-heading font-bold text-foreground">6:15 AM</p>
            <p className="text-xs text-muted-foreground">Wake Time</p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
