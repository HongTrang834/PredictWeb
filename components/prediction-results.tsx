"use client"

interface PredictionResultsProps {
  result: {
    formData: {
      area: number
      bedroom: number
      wc: number
      district: string
    }
    apiResponse: {
      success: boolean
      debug?: {
        district_code_used: number
        distance_km: number
      }
      info?: {
        input_district: string
        recognized_district: string
        distance_km: number
      }
      result: {
        xgboost: number
        deep_learning: number
        unit: string
      }
    }
  }
}

export default function PredictionResults({ result }: PredictionResultsProps) {
  const { formData, apiResponse } = result
  const { xgboost, deep_learning, unit } = apiResponse.result

  const debugInfo = apiResponse.debug || apiResponse.info
  const distance_km = debugInfo?.distance_km || 0
  const recognizedDistrict = apiResponse.info?.recognized_district || formData.district

  const formatPrice = (billion: number) => {
    const total = billion * 1_000_000_000
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(total)
  }

  return (
    <div className="space-y-4">
      {/* Input Summary */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-3">Your Input Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Area:</span>
            <p className="font-medium text-foreground">{formData.area} m²</p>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Bedrooms:</span>
            <p className="font-medium text-foreground">{formData.bedroom}</p>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Bathrooms:</span>
            <p className="font-medium text-foreground">{formData.wc}</p>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">District:</span>
            <p className="font-medium text-foreground">{recognizedDistrict}</p>
          </div>
          <div className="col-span-2 text-sm">
            <span className="text-muted-foreground">Distance from center:</span>
            <p className="font-medium text-foreground">{distance_km.toFixed(2)} km</p>
          </div>
        </div>
      </div>

      {/* XGBoost Model */}
      <div className="bg-card border-2 border-primary rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
            1
          </div>
          <h3 className="font-semibold text-foreground">XGBoost Model</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Price (Billions {unit})</span>
            <span className="text-lg font-bold text-primary">{xgboost.toFixed(3)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Price</span>
            <span className="text-lg font-bold text-primary">{formatPrice(xgboost)}</span>
          </div>
        </div>
      </div>

      {/* Deep Learning Model */}
      <div className="bg-card border-2 border-accent rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-accent-foreground text-sm font-bold">
            2
          </div>
          <h3 className="font-semibold text-foreground">Deep Learning (Neural Network)</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Price (Billions {unit})</span>
            <span className="text-lg font-bold text-accent">{deep_learning.toFixed(3)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Price</span>
            <span className="text-lg font-bold text-accent">{formatPrice(deep_learning)}</span>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="bg-secondary/30 border border-secondary rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-2">Quick Comparison</h3>
        <p className="text-sm text-muted-foreground">
          XGBoost predicts:{" "}
          <span className="font-semibold text-foreground">
            {xgboost.toFixed(3)} {unit}
          </span>
          <br />
          Neural Network predicts:{" "}
          <span className="font-semibold text-foreground">
            {deep_learning.toFixed(3)} {unit}
          </span>
          <br />
          Difference:{" "}
          <span className="font-semibold text-foreground">
            {Math.abs(xgboost - deep_learning).toFixed(3)} {unit}
          </span>
        </p>
      </div>
    </div>
  )
}
