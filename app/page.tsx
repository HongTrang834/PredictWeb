"use client"

import { useState } from "react"
import PricePredictorForm from "@/components/price-predictor-form"
import PredictionResults from "@/components/prediction-results"
import GoongMap from "@/components/goong-map"

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
  const [result, setResult] = useState<{ formData: FormData; apiResponse: PredictionResponse } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(
        "https://pbl6-group-danang-house-price-predictor-neuralnet.hf.space/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`API error: ${response.status} - ${errorData}`)
      }

      const data: PredictionResponse = await response.json()
      setResult({ formData, apiResponse: data })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get prediction."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setResult(null)
    setError(null)
  }

  return (
    <main className="relative w-full h-screen overflow-hidden">

      {/* MAP */}
      <div className="absolute inset-0">
        <GoongMap highlightDistrict={result?.formData.district} />
      </div>
      

      {/* ============================================================
        PANEL TRÁI – CHUYỂN ĐỔI FORM <-> RESULT
      ============================================================ */}
      <div
        className="
          absolute top-8 left-8 
          w-[420px]
          bg-white/85 backdrop-blur-xl 
          shadow-2xl border border-white/40 
          rounded-2xl p-6
          transition-all duration-300
        "
      >
        {/* Nếu CHƯA predict → hiển thị FORM */}
        {!result && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
            <p className="text-sm text-gray-600 -mt-2">Fill information to get the AI prediction</p>

            <PricePredictorForm onPredict={handlePredict} loading={loading} />

            {error && (
              <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded-lg mt-3">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Nếu ĐÃ predict → hiển thị RESULT */}
        {result && (
          <div className="space-y-4 animate-[fadeIn_0.35s_ease-out]">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Predicted Price 🔥</h2>

              {/* NÚT BACK */}
              <button
                onClick={handleBack}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                ← Back
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-xl shadow-lg">
              <PredictionResults result={result} />
            </div>

            <p className="text-gray-600 text-sm">
              AI-based estimation using neural network model.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================
         PANEL YOUR INPUT (TRÊN PHẢI) – vẫn giữ nguyên
      ============================================================ */}
      {result && (
        <div
          className="
            absolute top-8 right-8
            w-[280px]
            bg-white/80 backdrop-blur-xl
            shadow-xl border border-white/40
            rounded-2xl p-5
          "
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Input</h2>

          <div className="space-y-1 text-gray-700 text-sm">
            <p>📐 <b>Area:</b> {result.formData.area} m²</p>
            <p>🛏 <b>Bedrooms:</b> {result.formData.bedroom}</p>
            <p>🚿 <b>WC:</b> {result.formData.wc}</p>
            <p>📍 <b>District:</b> {result.formData.district}</p>
            
          </div>
        </div>
      )}
      

    </main>
  )
}
