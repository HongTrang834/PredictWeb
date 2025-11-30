"use client"

import { useEffect, useRef, useState } from "react"

interface GoongMapProps {
    highlightDistrict?: string
    onMapReady?: () => void
}

declare global {
    interface Window {
        goongjs: any
    }
}

// ✓ Hàm normalize bỏ dấu + lowercase
function normalize(str: string) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase()
}

// ✓ Tọa độ các quận/huyện (KHÔNG DẤU)
const districtCoordinates: Record<string, [number, number]> = {
    "hoavang": [107.4543, 15.8342],
    "huyenhoavang": [107.4543, 15.8342],

    "camle": [108.2033, 16.0679],
    "quancamle": [108.2033, 16.0679],

    "haichau": [108.2158, 16.0733],
    "quan haichau": [108.2158, 16.0733],
    "quanhaichau": [108.2158, 16.0733],

    "lienchieu": [108.1703, 16.0089],
    "quanlienchieu": [108.1703, 16.0089],

    "nguhanhson": [108.2517, 16.0278],
    "quan nguhanhson": [108.2517, 16.0278],
    "quannguhanhson": [108.2517, 16.0278],

    "sontra": [108.2764, 16.1122],
    "quansontra": [108.2764, 16.1122],

    "thanhkhe": [108.1897, 16.0558],
    "quanthanhkhe": [108.1897, 16.0558],
}

export default function GoongMap({ highlightDistrict, onMapReady }: GoongMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<any>(null)
    const markerRef = useRef<any>(null)

    const [mapLoaded, setMapLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const initMap = async () => {
            if (map.current || !mapContainer.current) return

            try {
                // Get token
                const tokenRes = await fetch("/api/goong-token")
                const tokenData = await tokenRes.json()
                const token = tokenData.token

                if (!token) throw new Error("Missing GOONG_ACCESS_TOKEN")

                // Load CSS
                if (!document.getElementById("goong-css")) {
                    const link = document.createElement("link")
                    link.id = "goong-css"
                    link.href =
                        "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css"
                    link.rel = "stylesheet"
                    document.head.appendChild(link)
                }

                // Load JS
                if (!window.goongjs) {
                    const script = document.createElement("script")
                    script.src =
                        "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js"
                    script.async = true
                    document.body.appendChild(script)

                    await new Promise((resolve, reject) => {
                        const maxAttempts = 50
                        let attempts = 0

                        const check = setInterval(() => {
                            attempts++
                            if (window.goongjs?.Map) {
                                clearInterval(check)
                                resolve(true)
                            }
                            if (attempts >= maxAttempts) {
                                clearInterval(check)
                                reject("Failed to load Goong Maps JS")
                            }
                        }, 100)
                    })
                }

                window.goongjs.accessToken = token

                // Create Map
                map.current = new window.goongjs.Map({
                    container: mapContainer.current,
                    style: "https://tiles.goong.io/assets/goong_map_web.json",
                    center: [108.2017, 16.0544],
                    zoom: 11,
                })

                map.current.on("load", () => {
                    setMapLoaded(true)
                    onMapReady?.()
                })
            } catch (err: any) {
                setError(err.message || "Unknown error")
            }
        }

        initMap()
    }, [onMapReady])

    // ✨ Highlight District — FIX HÒA VANG SAI MARKER
    useEffect(() => {
        if (!map.current || !mapLoaded || !highlightDistrict) return

        const key = normalize(highlightDistrict)
        const coords = districtCoordinates[key]

        if (!coords) {
            console.log("❌ Không tìm thấy quận:", highlightDistrict, "→ normalized:", key)
            return
        }

        console.log("📌 Highlight:", highlightDistrict, "→", coords)


        // Fly to district
        map.current.flyTo({
            center: coords,
            zoom: 13,
            duration: 1200,
        })

        // Xóa marker cũ
        if (markerRef.current) markerRef.current.remove()

        // Tạo marker mới (màu ĐỎ)
        const newMarker = new window.goongjs.Marker({ color: "#ff0000" })
            .setLngLat(coords)
            .addTo(map.current)

        markerRef.current = newMarker
    }, [highlightDistrict, mapLoaded])

    if (error) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-600">{error}</p>
            </div>
        )
    }


    return <div ref={mapContainer} className="w-full h-full" />
}
