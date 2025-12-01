"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormData {
  area: number
  bedroom: number
  wc: number
  district: string
}

interface PricePredictorFormProps {
  onPredict: (data: FormData) => void
  loading: boolean
}

export default function PricePredictorForm({ onPredict, loading }: PricePredictorFormProps) {
  const [formData, setFormData] = useState<FormData>({
    area: 100,
    bedroom: 3,
    wc: 2,
    district: "Hòa Vang",
  })

  const districts = [
    "Hoà Vang",
    "Cẩm Lệ",
    "Hải Châu",
    "Liên Chiểu",
    "Ngũ Hành Sơn",
    "Sơn Trà",
    "Thanh Khê",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "district" ? value : Number(value),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onPredict(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div>
        <Label htmlFor="area" className="block text-sm font-medium text-foreground mb-2">
          Area (m²)
        </Label>
        <Input
          id="area"
          name="area"
          type="number"
          min="0"
          step="1"
          value={formData.area}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="bedroom" className="block text-sm font-medium text-foreground mb-2">
          Bedrooms
        </Label>
        <Input
          id="bedroom"
          name="bedroom"
          type="number"
          min="0"
          max="10"
          value={formData.bedroom}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="wc" className="block text-sm font-medium text-foreground mb-2">
          Bathrooms/WC
        </Label>
        <Input
          id="wc"
          name="wc"
          type="number"
          min="0"
          max="10"
          value={formData.wc}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="district" className="block text-sm font-medium text-foreground mb-2">
          District
        </Label>
        <select
          id="district"
          name="district"
          value={formData.district}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground disabled:opacity-50"
          disabled={loading}
        >
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? "Predicting..." : "Get Prediction"}
      </Button>
    </form>
  )
}
