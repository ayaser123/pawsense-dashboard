"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    console.log("[Dashboard] Auth state:", { user: user?.email, authLoading })
  }, [user, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🐾</div>
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a moment...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log("[Dashboard] User not authenticated, redirecting to signup")
    return <Navigate to="/signup" />
  }

  console.log("[Dashboard] User authenticated:", user.email)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Test Dashboard Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Welcome to PawSense Dashboard! ✅</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg text-gray-700">
                Logged in as: <strong>{user?.email}</strong>
              </p>
            </div>
            <div>
              <p className="text-lg text-gray-700">
                Name: <strong>{user?.user_metadata?.full_name || "No name set"}</strong>
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900">
                ✨ Dashboard is loading. Full features coming soon!
              </p>
            </div>
            <Button 
              onClick={() => console.log("Dashboard working!")}
              className="mt-4"
            >
              Test Button
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Mood</p>
                <p className="text-3xl font-bold text-primary">😊</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Activity</p>
                <p className="text-3xl font-bold text-green-500">⚡</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Sleep</p>
                <p className="text-3xl font-bold text-purple-500">😴</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Health</p>
                <p className="text-3xl font-bold text-orange-500">❤️</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
