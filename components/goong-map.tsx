"use client"

import { useEffect, useRef } from "react"

// Định nghĩa kiểu dữ liệu cho địa điểm (dựa trên dữ liệu dự án cũ của bạn)
interface Place {
    id: string | number
    name: string
    lat: number
    lng: number
}

interface MapComponentProps {
    placesData: Place[]
    onMarkerClick?: (index: number) => void
}

export default function MapComponent({ placesData, onMarkerClick }: MapComponentProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])

    // Lấy Access Token từ biến môi trường
    const accessToken = process.env.NEXT_PUBLIC_GOONG_MAP_KEY

    // 1. Khởi tạo bản đồ (Chỉ chạy 1 lần)
    useEffect(() => {
        if (mapRef.current) return

        // Hàm kiểm tra và load map
        const initMap = () => {
            // @ts-ignore - Vì load qua CDN nên TS không biết window.goongjs là gì
            const goongjs = window.goongjs

            if (!goongjs) {
                // Nếu chưa load xong script thì thử lại sau 100ms
                setTimeout(initMap, 100)
                return
            }

            goongjs.accessToken = accessToken

            mapRef.current = new goongjs.Map({
                container: mapContainerRef.current,
                style: "https://tiles.goong.io/assets/goong_map_web.json",
                center: [108.2208, 16.0471], // Trung tâm Đà Nẵng
                zoom: 13,
            })

            // Thêm nút điều hướng zoom
            mapRef.current.addControl(new goongjs.NavigationControl(), "top-right")
        }

        initMap()

        // Cleanup khi component bị hủy
        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [accessToken])

    // 2. Cập nhật Marker khi dữ liệu placesData thay đổi
    useEffect(() => {
        // Đợi map và thư viện load xong
        // @ts-ignore
        if (!mapRef.current || !window.goongjs) return
        // @ts-ignore
        const goongjs = window.goongjs

        // Xóa marker cũ
        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current = []

        if (!placesData || placesData.length === 0) return

        // Tạo bounds để tự động zoom bản đồ chứa tất cả điểm
        const bounds = new goongjs.LngLatBounds()

        placesData.forEach((place, index) => {
            // Tạo marker màu xanh (giống dự án tham khảo)
            const marker = new goongjs.Marker({ color: "#007BFF" })
                .setLngLat([place.lng, place.lat])
                .addTo(mapRef.current)

            // Thêm sự kiện click
            const element = marker.getElement()
            element.style.cursor = "pointer"
            element.addEventListener("click", () => {
                if (onMarkerClick) onMarkerClick(index)

                // Hiệu ứng bay tới điểm đó khi click (tùy chọn)
                mapRef.current.flyTo({
                    center: [place.lng, place.lat],
                    zoom: 15,
                    speed: 1.2
                })
            })

            markersRef.current.push(marker)
            bounds.extend([place.lng, place.lat])
        })

        // Zoom bản đồ để thấy hết các marker
        if (placesData.length > 0) {
            mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 16 })
        }
    }, [placesData, onMarkerClick])

    return (
        <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-border shadow-sm">
            <div ref={mapContainerRef} className="w-full h-full" />
            {/* Overlay loading nếu cần thiết */}
        </div>
    )
}