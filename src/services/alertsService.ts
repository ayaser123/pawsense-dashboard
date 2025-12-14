// Alert management service - converts analysis to alerts and manages alert storage

import type { AnalysisResult } from "@/pages/Dashboard";
import type { Pet } from "@/data/petData";

export interface Alert {
  id: string;
  type: "warning" | "info" | "success" | "critical";
  title: string;
  message: string;
  pet: Pet;
  timestamp: string;
  read: boolean;
  action?: string;
  source: "analysis" | "manual" | "system";
}

const ALERTS_STORAGE_KEY = "pawsense_alerts";

/**
 * Convert video analysis to an alert
 */
export function createAlertFromAnalysis(
  analysis: AnalysisResult,
  pet: Pet
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  const timestamp = formatTimestamp(now);

  // Alert 1: Main behavior analysis
  alerts.push({
    id: `alert_${Date.now()}_${Math.random()}`,
    type: "info",
    title: "Video Analysis Complete",
    message: `${pet.name}'s video has been analyzed. Detected behavior: ${analysis.behavior}`,
    pet,
    timestamp,
    read: false,
    source: "analysis",
  });

  // Alert 2: Mood assessment
  const moodAlertType = getMoodAlertType(analysis.mood);
  if (moodAlertType === "warning" || moodAlertType === "critical") {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random()}_mood`,
      type: moodAlertType,
      title: `Mood Alert: ${analysis.mood}`,
      message: `${pet.name} appears to be ${analysis.mood.toLowerCase()}. Monitor their behavior and provide appropriate support.`,
      pet,
      timestamp,
      read: false,
      action: moodAlertType === "critical" ? "Find Vet" : undefined,
      source: "analysis",
    });
  }

  // Alert 3: Energy level warning
  if (analysis.energy === "Low") {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random()}_energy`,
      type: "warning",
      title: "Low Energy Detected",
      message: `${pet.name} is showing low energy levels. Ensure they have adequate rest and monitor for signs of illness.`,
      pet,
      timestamp,
      read: false,
      action: "Monitor",
      source: "analysis",
    });
  }

  // Alert 4: High confidence positive assessment
  if (analysis.confidence > 0.9 && (analysis.mood === "Happy" || analysis.mood === "Playful")) {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random()}_positive`,
      type: "success",
      title: "Health Status: Excellent",
      message: `${pet.name} appears healthy and happy! Keep up the great pet care.`,
      pet,
      timestamp,
      read: false,
      source: "analysis",
    });
  }

  return alerts;
}

/**
 * Determine alert type based on mood
 */
function getMoodAlertType(mood: string): Alert["type"] {
  const normalMoods = ["Happy", "Playful", "Calm", "Alert", "Curious"];
  const warningMoods = ["Anxious", "Stressed", "Restless"];
  const criticalMoods = ["Sick", "Lethargic", "Injured", "In Pain"];

  if (criticalMoods.some(m => mood.includes(m))) return "critical";
  if (warningMoods.some(m => mood.includes(m))) return "warning";
  return "info";
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

/**
 * Load alerts from localStorage
 */
export function loadAlerts(): Alert[] {
  try {
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading alerts:", error);
    return [];
  }
}

/**
 * Save alerts to localStorage
 */
export function saveAlerts(alerts: Alert[]): void {
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error("Error saving alerts:", error);
  }
}

/**
 * Add new alerts to existing ones
 */
export function addAlerts(newAlerts: Alert[]): Alert[] {
  const existing = loadAlerts();
  const combined = [...newAlerts, ...existing];
  saveAlerts(combined);
  return combined;
}

/**
 * Mark alert as read
 */
export function markAlertAsRead(alertId: string): Alert[] {
  const alerts = loadAlerts();
  const updated = alerts.map((a) =>
    a.id === alertId ? { ...a, read: true } : a
  );
  saveAlerts(updated);
  return updated;
}

/**
 * Delete alert
 */
export function deleteAlert(alertId: string): Alert[] {
  const alerts = loadAlerts();
  const updated = alerts.filter((a) => a.id !== alertId);
  saveAlerts(updated);
  return updated;
}

/**
 * Get unread count
 */
export function getUnreadCount(): number {
  const alerts = loadAlerts();
  return alerts.filter((a) => !a.read).length;
}

/**
 * Get critical alerts count
 */
export function getCriticalCount(): number {
  const alerts = loadAlerts();
  return alerts.filter(
    (a) => a.type === "critical" || (a.type === "warning" && !a.read)
  ).length;
}
