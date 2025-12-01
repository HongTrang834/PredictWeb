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

      {/* PANEL MAIN (FORM / KẾT QUẢ) */}
      <div
        className="
          absolute top-8 left-8 
          w-[440px]
          bg-white/50 backdrop-blur-xl
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          border border-white/40 
          rounded-3xl p-7
          transition-all duration-300
        "
      >

        {/* FORM */}
        {!result && (
          <div className="space-y-6 animate-[fadeIn_0.35s_ease-out]">

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Property Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Enter your property info to get AI-estimated market price
              </p>
            </div>

            <PricePredictorForm onPredict={handlePredict} loading={loading} />

            {error && (
              <div className="bg-red-100 text-red-700 border border-red-300 p-4 rounded-xl">
                {error}
              </div>
            )}
          </div>
        )}

        {/* KẾT QUẢ */}
        {result && (
          <div className="space-y-5 animate-[fadeIn_0.35s_ease-out]">

            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Predicted Price
              </h2>

              {/* NÚT BACK */}
              <button
                onClick={handleBack}
                className="
                  px-4 py-2 
                  text-sm font-medium
                  bg-gray-800/90 text-white
                  rounded-xl
                  hover:bg-gray-900
                  active:scale-95
                  transition
                "
              >
                ← Back
              </button>
            </div>

            {/* CARD KẾT QUẢ */}
            <div className="
              bg-gradient-to-br from-indigo-600 to-purple-700
              text-white p-6 rounded-2xl shadow-2xl
              flex flex-col gap-2
            ">
              <PredictionResults result={result} />
            </div>

            <p className="text-gray-600 text-sm">
              AI model predicted this value based on district, area & rooms.
            </p>
          </div>
        )}
      </div>

      {/* PANEL YOUR INPUT (PHẢI TRÊN) */}
      {result && (
        <div
          className="
            absolute top-8 right-8
            w-[300px]
            bg-white/50 backdrop-blur-xl
            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            border border-white/40
            rounded-3xl p-6
          "
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Your Input
          </h2>

          <div className="space-y-2 text-gray-800 text-sm">
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
