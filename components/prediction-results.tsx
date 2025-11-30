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
  }
}

export default function PredictionResults({ result }: PredictionResultsProps) {
  const { formData, apiResponse } = result
  // Lấy kết quả từ cấu trúc JSON mới
  const { result: price, unit } = apiResponse.result
  const { recognized_district, distance_km } = apiResponse.info

  const formatPrice = (billion: number) => {
    // Giả định đơn vị vẫn là tỷ đồng (dựa trên code cũ)
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
            <p className="font-medium text-foreground">{recognized_district}</p>
          </div>
          <div className="col-span-2 text-sm">
            <span className="text-muted-foreground">Distance from center:</span>
            <p className="font-medium text-foreground">{distance_km.toFixed(2)} km</p>
          </div>
        </div>
      </div>

      {/* Kết quả dự đoán duy nhất */}
      <div className="bg-card border-2 border-primary rounded-lg p-6 shadow-md transition-all hover:shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-lg">
            🏠
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Estimated Market Price</h3>
            <p className="text-sm text-muted-foreground">Powered by Neural Network</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg border border-border/50">
            <div className="flex justify-between items-end mb-1">
              <span className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Total Value</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{formatPrice(price)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              (~ {price.toFixed(3)} {unit})
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}