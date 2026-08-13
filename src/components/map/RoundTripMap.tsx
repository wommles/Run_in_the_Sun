import { useState, useEffect } from "react"
import { useMapEvents } from "react-leaflet"
import L from "leaflet"
import { getRoundTripRoute } from "../../api/getRoundTripRoute"
import { parseORSRoute } from "../../parseORSRoute"
import MapDisplay, { type MapMarker } from "./MapDisplay"
import type { ORSDirectionsResponse } from "../../types/directions"

// Leaflet icon will be handled by MapDisplay

type LatLng = [number, number]

interface RoundTripMapProps {
  onRouteData?: (data: ORSDirectionsResponse | undefined) => void
}

export default function RoundTripMap({ onRouteData }: RoundTripMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<LatLng | null>(null)
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [routes, setRoutes] = useState<L.LatLng[][]>()
  const [routeLength, setRouteLength] = useState<number>(5) // Default 5km
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [profile, setProfile] = useState<string>("foot-walking")

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

  // Reset selection
  const handleReset = () => {
    setSelectedPoint(null)
    setRoutes(undefined)
    onRouteData?.(undefined)
  }

  const handleSearch = async () => {
    if (selectedPoint && routeLength > 0) {
      setIsLoading(true)
      try {
        const data = await getRoundTripRoute(profile, selectedPoint, routeLength)
        console.log("ORS round trip result:", data)
        onRouteData?.(data)
        
        // Parse and display route
        const parsedRoutes = parseORSRoute(data)
        if (parsedRoutes) {
          setRoutes(parsedRoutes)
        }
      } catch (err) {
        console.error("Round trip route error:", err)
        alert(`Failed to get round trip route: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    } else {
      alert("Please select a point on the map and enter a valid route length.")
    }
  }

  function PointSelector() {
    useMapEvents({
      click(e) {
        const pos: LatLng = [e.latlng.lat, e.latlng.lng]
        setSelectedPoint(pos)
        // Clear previous route when selecting new point
        setRoutes(undefined)
        onRouteData?.(undefined)
      },
    })

    return null
  }

  // Prepare markers for MapDisplay
  const markers: MapMarker[] = []
  if (selectedPoint) markers.push({ position: selectedPoint })

  return (
    <div style={{ position: "relative" }}>
      <MapDisplay
        userLocation={userLocation}
        routes={routes}
        markers={markers}
      >
        <PointSelector />
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
        <h4 style={{ margin: "0 0 10px 0" }}>Round Trip Route</h4>
        
        {/* Profile selection */}
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="profile-select"><b>Profile:</b></label>
          <select 
            id="profile-select"
            value={profile} 
            onChange={(e) => setProfile(e.target.value)}
            style={{ marginLeft: "8px", width: "140px" }}
          >
            <option value="foot-walking">Walking</option>
            <option value="foot-hiking">Hiking</option>
            <option value="cycling-regular">Cycling</option>
            <option value="driving-car">Driving</option>
          </select>
        </div>

        {/* Route length input */}
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="length-input"><b>Length (km):</b></label>
          <input
            id="length-input"
            type="number"
            min="1"
            max="50"
            step="0.5"
            value={routeLength}
            onChange={(e) => setRouteLength(parseFloat(e.target.value) || 1)}
            style={{ marginLeft: "8px", width: "80px" }}
          />
        </div>

        {/* Selected point display */}
        <div style={{ marginBottom: "10px" }}>
          <p style={{ margin: "5px 0" }}>
            <b>Start/End Point:</b>{" "}
            {selectedPoint
              ? `${selectedPoint[0].toFixed(5)}, ${selectedPoint[1].toFixed(5)}`
              : "Click on map"}
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
            disabled={isLoading || !selectedPoint}
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
