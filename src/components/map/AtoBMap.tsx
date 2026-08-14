import { useState, useEffect } from "react"
import { useMapEvents } from "react-leaflet"
import L from "leaflet"
import { getRoute } from "../../api/getRoute"
import { getStartEndPoints, parseORSRoute, parseORSRouteSurfaceSegments, getRouteDrawerStats } from "../../parseORSRoute"
import MapDisplay, { type MapMarker } from "./MapDisplay"
import type { RouteSurfaceSegment, RouteDrawerStats } from "../../parseORSRoute"
import type { ORSDirectionsResponse } from "../../types/directions"

// Leaflet icon will be handled by MapDisplay

type LatLng = [number, number]

interface AtoBMapProps {
  onRouteData?: (data: ORSDirectionsResponse | undefined) => void
}

export default function AtoBMap({ onRouteData }: AtoBMapProps) {
  const [start, setStart] = useState<LatLng | null>(null)
  const [end, setEnd] = useState<LatLng | null>(null)
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [routes, setRoutes] = useState<L.LatLng[][]>()
  const [routeSegments, setRouteSegments] = useState<RouteSurfaceSegment[]>()
  const [routeStats, setRouteStats] = useState<RouteDrawerStats>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Request user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
      },
      (err) => {
        console.error("Geolocation error:", err)
      }
    )
  }, [])

  // Reset points
  const handleReset = () => {
    setStart(null)
    setEnd(null)
    setRoutes(undefined)
    setRouteSegments(undefined)
    setRouteStats(undefined)
    onRouteData?.(undefined)
  }

  const handleSearch = async () => {
    if (start && end) {
      setIsLoading(true)
      try {
        const data = await getRoute("foot-walking", start, end)
        console.log("ORS A-to-B result:", data)
        onRouteData?.(data)
        
        const parsedRoutes = parseORSRoute(data)
        if (parsedRoutes) setRoutes(parsedRoutes)
        setRouteSegments(parseORSRouteSurfaceSegments(data))
        setRouteStats(getRouteDrawerStats(data))
        
        const points = getStartEndPoints(data)
        if (points) {
          const startPoint: LatLng = [points.start.lat, points.start.lng]
          setStart(startPoint)
          const endPoint: LatLng = [points.end.lat, points.end.lng]
          setEnd(endPoint)
        }
      } catch (err) {
        console.error("A-to-B route error:", err)
        alert(`Failed to get route: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    } else {
      alert("Please select both start and end points on the map.")
    }
  }

  function LocationSelector({
    setStart,
    setEnd,
  }: {
    setStart: (pos: LatLng) => void
    setEnd: (pos: LatLng) => void
  }) {
    useMapEvents({
      click(e) {
        const pos: LatLng = [e.latlng.lat, e.latlng.lng]

        if (!start) {
          setStart(pos)
        } else if (!end) {
          setEnd(pos)
        }
        
        // Clear previous route when selecting new points
        setRoutes(undefined)
        setRouteSegments(undefined)
        setRouteStats(undefined)
        onRouteData?.(undefined)
      },
    })

    return null
  }

  // Prepare markers for MapDisplay
  const markers: MapMarker[] = []
  if (start) markers.push({ position: start })
  if (end) markers.push({ position: end })

  return (
    <div style={{ position: "relative" }}>
      <MapDisplay
        userLocation={userLocation}
        routes={routes}
        routeSegments={routeSegments}
        routeStats={routeStats}
        markers={markers}
      >
        <LocationSelector setStart={setStart} setEnd={setEnd} />
      </MapDisplay>

      {/* Control panel overlay */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "white",
          padding: "10px",
          borderRadius: "6px",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
          zIndex: 1000,
          minWidth: "250px",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0" }}>A-to-B Route</h4>
        
        {/* Fixed to foot-walking profile */}
        <div style={{ marginBottom: "10px", color: "#666", fontSize: "14px" }}>
          Profile: Walking (foot-walking)
        </div>

        {/* Selected points display */}
        <div style={{ marginBottom: "10px" }}>
          <p style={{ margin: "5px 0" }}>
            <b>Start:</b>{" "}
            {start
              ? `${start[0].toFixed(5)}, ${start[1].toFixed(5)}`
              : "Click map"}
          </p>
          <p style={{ margin: "5px 0" }}>
            <b>End:</b>{" "}
            {end
              ? `${end[0].toFixed(5)}, ${end[1].toFixed(5)}`
              : "Click map again"}
          </p>
        </div>

        {/* Action buttons */}
        <div>
          <button 
            onClick={handleReset} 
            style={{ marginRight: "10px" }}
            disabled={isLoading}
          >
            Reset
          </button>
          <button 
            onClick={handleSearch}
            disabled={isLoading || !start || !end}
            style={{
              backgroundColor: isLoading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Searching..." : "Search Route"}
          </button>
        </div>
      </div>

    </div>
  )
}
