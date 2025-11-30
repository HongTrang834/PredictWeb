"use client"

import { useState } from "react"
import PricePredictorForm from "@/components/price-predictor-form"
import PredictionResults from "@/components/prediction-results"
import Header from "@/components/header"

interface PredictionResponse {
  success: boolean
  debug: {
    district_code_used: number
    distance_km: number
  }
  result: {
    xgboost: number
    deep_learning: number
    unit: string
  }
  inputs_processed?: {
    area: number
    bedroom: number
    wc: number
    district_input: string
    district_recognized: string
  }
}

interface FormData {
  area: number
  bedroom: number
  wc: number
  district: string
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    formData: FormData
    apiResponse: PredictionResponse
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Sending prediction request with:", formData)

      const response = await fetch("https://pbl6-group-danang-house-price-predictor.hf.space/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          area: formData.area,
          bedroom: formData.bedroom,
          wc: formData.wc,
          district: formData.district,
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.log("[v0] Error response:", errorData)
        throw new Error(`API error: ${response.status} - ${errorData}`)
      }

      const data: PredictionResponse = await response.json()
      console.log("[v0] Prediction result:", data)
      setResult({ formData, apiResponse: data })
    } catch (err) {
      console.log("[v0] Catch error:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get prediction. Please check your inputs and try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Property Details</h2>
              <p className="text-muted-foreground">Enter your property information to get AI predictions</p>
            </div>
            <PricePredictorForm onPredict={handlePredict} loading={loading} />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Price Predictions</h2>
              <p className="text-muted-foreground">Compare XGBoost & Deep Learning models</p>
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {result && <PredictionResults result={result} />}
            {!result && !error && (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Submit the form to see predictions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
