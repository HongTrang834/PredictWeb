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

export default function GoongMap({ highlightDistrict, onMapReady }: GoongMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const districtCoordinates: Record<string, [number, number]> = {
    "huyện hoà vang": [107.4543, 15.8342],
    "hoà vang": [107.4543, 15.8342],
    "quận cẩm lệ": [108.2033, 16.0679],
    "cẩm lệ": [108.2033, 16.0679],
    "quận hải châu": [108.2158, 16.0733],
    "hải châu": [108.2158, 16.0733],
    "quận liên chiểu": [108.1703, 16.0089],
    "liên chiểu": [108.1703, 16.0089],
    "quận ngũ hành sơn": [108.2517, 16.0278],
    "ngũ hành sơn": [108.2517, 16.0278],
    "quận sơn trà": [108.2764, 16.1122],
    "sơn trà": [108.2764, 16.1122],
    "quận thanh khê": [108.1897, 16.0558],
    "thanh khê": [108.1897, 16.0558],
  }

  useEffect(() => {
    const initMap = async () => {
      if (map.current) return
      if (!mapContainer.current) return

      try {
        const tokenRes = await fetch("/api/goong-token")
        const tokenData = await tokenRes.json()
        const token = tokenData.token

        console.log("[v0] Token received:", token ? "✓" : "✗")
        console.log("[v0] Token value check:", token || "TOKEN IS UNDEFINED")

        if (!token) {
          throw new Error("Token not configured. Please add GOONG_ACCESS_TOKEN to environment variables.")
        }

        // Load CSS and JS libraries if not already loaded
        if (!window.goongjs) {
          // Load CSS
          const link = document.createElement("link")
          link.href = "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css"
          link.rel = "stylesheet"
          document.head.appendChild(link)

          // Load JS
          const script = document.createElement("script")
          script.src = "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js"
          script.async = true
          document.body.appendChild(script)

          // Wait for goongjs to be available
          await new Promise((resolve, reject) => {
            const maxAttempts = 50
            let attempts = 0
            const checkInterval = setInterval(() => {
              attempts++
              if (window.goongjs && window.goongjs.Map) {
                clearInterval(checkInterval)
                resolve(true)
              }
              if (attempts >= maxAttempts) {
                clearInterval(checkInterval)
                reject(new Error("Goong Maps library failed to load"))
              }
            }, 100)
          })
        }

        window.goongjs.accessToken = token
        console.log("[v0] Token set on goongjs.accessToken")

        // Create map instance
        map.current = new window.goongjs.Map({
          container: mapContainer.current,
          style: "https://tiles.goong.io/assets/goong_map_web.json",
          center: [108.2017, 16.0544],
          zoom: 11,
        })

        // Handle map load event
        map.current.on("load", () => {
          console.log("[v0] Map loaded successfully")
          setMapLoaded(true)
          onMapReady?.()
        })

        // Handle map errors with better logging
        map.current.on("error", (e: any) => {
          console.error("[v0] Goong Maps error event:", e)
          let errorMsg = "Unknown map error"
          if (e?.error?.message) {
            errorMsg = e.error.message
          } else if (typeof e === "string") {
            errorMsg = e
          } else if (e?.message) {
            errorMsg = e.message
          }
          console.error("[v0] Map error details:", errorMsg)
          setError(`Map error: ${errorMsg}`)
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error("[v0] Map initialization error:", errorMsg, err)
        setError(errorMsg)
      }
    }

    initMap()
  }, [onMapReady])

  useEffect(() => {
    if (!map.current || !mapLoaded || !highlightDistrict) return

    const coords = districtCoordinates[highlightDistrict.toLowerCase()]
    if (!coords) {
      console.log("[v0] No coordinates for district:", highlightDistrict)
      return
    }

    console.log("[v0] Highlighting district:", highlightDistrict, "at", coords)

    map.current.flyTo({
      center: coords,
      zoom: 13,
      duration: 1500,
    })

    // Add popup marker at district center
    const popup = new window.goongjs.Popup({ offset: 25 }).setHTML(
      `<div class="p-2 bg-white rounded">
        <h3 class="font-semibold text-foreground">${highlightDistrict}</h3>
        <p class="text-sm text-muted-foreground">Selected District</p>
      </div>`,
    )

    new window.goongjs.Marker({ color: "#3b82f6" }).setLngLat(coords).setPopup(popup).addTo(map.current)
  }, [highlightDistrict, mapLoaded])

  if (error) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-semibold">Map Error</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-4">
            Make sure GOONG_ACCESS_TOKEN is added to your environment variables in the Vars section.
          </p>
        </div>
      </div>
    )
  }

  return <div ref={mapContainer} className="w-full h-screen bg-gray-100" />
}
