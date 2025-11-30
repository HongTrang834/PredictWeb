"use client"

import { useState } from "react"
import PricePredictorForm from "@/components/price-predictor-form"
import PredictionResults from "@/components/prediction-results"
import Header from "@/components/header"

// Cập nhật Interface dựa trên OpenAPI mới
interface PredictionResponse {
  success: boolean
  info: {
    input_district: string
    recognized_district: string
    distance_km: number
  }
  result: {
    result: number
    unit: string
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

      // Lưu ý: Nếu URL API thay đổi, hãy cập nhật dòng bên dưới
      const response = await fetch("https://pbl6-group-danang-house-price-predictor-neuralnet.hf.space/predict", {
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Price Prediction</h2>
              <p className="text-muted-foreground">AI Neural Network Estimation</p>
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {result && <PredictionResults result={result} />}
            {!result && !error && (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Submit the form to see the estimated price</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}