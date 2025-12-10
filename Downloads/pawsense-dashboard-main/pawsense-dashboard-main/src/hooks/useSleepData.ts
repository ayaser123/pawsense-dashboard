"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./useAuth"
import apiClient from "@/lib/api"

export interface SleepRecord {
  id: string
  pet_id: string
  start_time: string
  end_time?: string
  duration_minutes?: number
  quality?: string
  notes?: string
  created_at: string
}

export interface SleepChartData {
  time: string
  deepSleep: number
  lightSleep: number
  awake: number
}

interface UseSleepDataResult {
  sleepRecords: SleepRecord[]
  chartData: SleepChartData[]
  sleepQuality: string
  totalSleep: number
  loading: boolean
  error: string | null
  recordSleep: (petId: string, startTime: string, endTime?: string, quality?: string) => Promise<SleepRecord | null>
  refetch: () => Promise<void>
}

export function useSleepData(petId?: string): UseSleepDataResult {
  const { user } = useAuth()
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSleepData = useCallback(async () => {
    if (!user || !petId) {
      setSleepRecords([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get(`/api/sleep?pet_id=${petId}`)
      setSleepRecords(response.data || [])
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } }; message?: string }
      setError(apiErr.response?.data?.error || "Failed to fetch sleep data")
      setSleepRecords([])
    } finally {
      setLoading(false)
    }
  }, [user, petId])

  useEffect(() => {
    fetchSleepData()
  }, [fetchSleepData])

  const chartData: SleepChartData[] = sleepRecords.map((record, index) => {
    const startHour = new Date(record.start_time).getHours()
    const hour = `${(startHour + index) % 24}:00`

    // Simulate sleep quality distribution
    const quality = record.quality || "good"
    let deepSleep = 60,
      lightSleep = 30,
      awake = 10

    if (quality === "poor") {
      deepSleep = 20
      lightSleep = 40
      awake = 40
    } else if (quality === "excellent") {
      deepSleep = 80
      lightSleep = 15
      awake = 5
    }

    return { time: hour, deepSleep, lightSleep, awake }
  })

  const sleepQuality =
    chartData.length > 0
      ? chartData.reduce((acc, d) => acc + d.deepSleep, 0) / chartData.length > 60
        ? "Excellent"
        : "Good"
      : "Insufficient Data"

  const totalSleep = sleepRecords.reduce((acc, r) => acc + (r.duration_minutes || 0), 0) / 60

  const recordSleep = async (
    petId: string,
    startTime: string,
    endTime?: string,
    quality?: string,
  ): Promise<SleepRecord | null> => {
    try {
      setError(null)
      const response = await apiClient.post("/api/sleep", {
        pet_id: petId,
        start_time: startTime,
        end_time: endTime,
        quality,
      })
      setSleepRecords([...sleepRecords, response.data])
      return response.data
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } }; message?: string }
      const errorMsg = apiErr.response?.data?.error || "Failed to record sleep"
      setError(errorMsg)
      console.error("[v0] Sleep record error:", errorMsg)
      return null
    }
  }

  const refetch = async () => {
    await fetchSleepData()
  }

  return {
    sleepRecords,
    chartData,
    sleepQuality,
    totalSleep,
    loading,
    error,
    recordSleep,
    refetch,
  }
}
