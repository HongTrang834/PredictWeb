"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Dữ liệu đầu ra (khi submit) vẫn giữ nguyên là number
interface FormData {
  area: number
  bedroom: number
  wc: number
  district: string
}

// Dữ liệu nội bộ của Form (cho phép string để xử lý việc xóa trống ô input)
interface FormState {
  area: string | number
  bedroom: string | number
  wc: string | number
  district: string
}

interface PricePredictorFormProps {
  onPredict: (data: FormData) => void
  loading: boolean
}

export default function PricePredictorForm({ onPredict, loading }: PricePredictorFormProps) {
  // State khởi tạo
  const [formData, setFormData] = useState<FormState>({
    area: 100,
    bedroom: 3,
    wc: 2,
    district: "Hòa Vang",
  })

  const [errors, setErrors] = useState({
    area: "",
    bedroom: "",
    wc: "",
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

  const validate = (name: string, value: string | number) => {
    let error = ""
    const strValue = String(value).trim()

    // Kiểm tra rỗng
    if (strValue === "") {
      setErrors((prev) => ({ ...prev, [name]: "Trường này không được để trống." }))
      return false
    }

    const num = Number(value)

    if (name === "area") {
      if (isNaN(num) || num <= 0) error = "Diện tích phải là số thực lớn hơn 0."
    }

    if (name === "bedroom" || name === "wc") {
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        error = `${name === "bedroom" ? "Phòng ngủ" : "WC"} phải là số nguyên không âm.`
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
    return error === ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Xử lý District (không cần validate số)
    if (name === "district") {
      setFormData((prev) => ({ ...prev, district: value }))
      return
    }

    // QUAN TRỌNG: Cập nhật state với giá trị thô (string) ngay lập tức
    // để người dùng có thể xóa trắng hoặc gõ dấu chấm
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Validate real-time (báo lỗi nếu nhập sai format, nhưng vẫn cho phép nhập)
    validate(name, value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Kiểm tra lỗi lần cuối cho toàn bộ form
    const isAreaValid = validate("area", formData.area)
    const isBedValid = validate("bedroom", formData.bedroom)
    const isWcValid = validate("wc", formData.wc)

    if (!isAreaValid || !isBedValid || !isWcValid) {
      //   alert("Vui lòng sửa lỗi trước khi submit.") // Có thể bỏ alert nếu đã hiện text đỏ
      return
    }

    // Chuyển đổi data về đúng dạng number trước khi gửi đi
    const submitData: FormData = {
      area: Number(formData.area),
      bedroom: Number(formData.bedroom),
      wc: Number(formData.wc),
      district: formData.district
    }

    onPredict(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* AREA */}
      <div>
        <Label htmlFor="area" className="block text-sm font-medium text-foreground mb-2">
          Area (m²)
        </Label>
        <Input
          id="area"
          name="area"
          type="number" // Vẫn giữ type number để hiện bàn phím số trên mobile
          min="0"
          step="0.1"
          value={formData.area}
          onChange={handleChange}
          disabled={loading}
          className={errors.area ? "border-red-500" : ""}
        />
        {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
      </div>

      {/* BEDROOM */}
      <div>
        <Label htmlFor="bedroom" className="block text-sm font-medium text-foreground mb-2">
          Bedrooms
        </Label>
        <Input
          id="bedroom"
          name="bedroom"
          type="number"
          min="0"
          step="1"
          value={formData.bedroom}
          onChange={handleChange}
          disabled={loading}
          className={errors.bedroom ? "border-red-500" : ""}
        />
        {errors.bedroom && <p className="text-red-500 text-xs mt-1">{errors.bedroom}</p>}
      </div>

      {/* WC */}
      <div>
        <Label htmlFor="wc" className="block text-sm font-medium text-foreground mb-2">
          Bathrooms/WC
        </Label>
        <Input
          id="wc"
          name="wc"
          type="number"
          min="0"
          step="1"
          value={formData.wc}
          onChange={handleChange}
          disabled={loading}
          className={errors.wc ? "border-red-500" : ""}
        />
        {errors.wc && <p className="text-red-500 text-xs mt-1">{errors.wc}</p>}
      </div>

      {/* DISTRICT */}
      <div>
        <Label htmlFor="district" className="block text-sm font-medium text-foreground mb-2">
          District
        </Label>
        <select
          id="district"
          name="district"
          value={formData.district}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
        >
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-4">
        {loading ? "Predicting..." : "Get Prediction"}
      </Button>
    </form>
  )
}