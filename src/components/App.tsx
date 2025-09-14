import { useState, useEffect } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Polyline,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { getRoute } from "../getRoute"
import { getStartEndPoints, parseORSRoute } from "../parseORSRoute"
import { RouteInfo } from "./RouteInfo"
import type { ORSDirectionsResponse } from "../types/directions"

// Default Leaflet marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

type LatLng = [number, number]

export default function MapPicker() {
  const [start, setStart] = useState<LatLng | null>(null)
  const [end, setEnd] = useState<LatLng | null>(null)
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [routes, setRoutes] = useState<L.LatLng[][]>()
  const [directionData, setDirectionData] = useState<ORSDirectionsResponse>()

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
    setDirectionData(undefined)
  }

  const handleSearch = async () => {
    if (start && end) {
      try {
        const data = await getRoute("foot-walking", start, end)
        console.log("ORS result:", data)
        setDirectionData(data)
        const r = parseORSRoute(data)
        if (r) setRoutes(r)
        console.log(r)
        const points = getStartEndPoints(data)
        if (points) {
          const start: LatLng = [points.start.lat, points.start.lng]
          setStart(start)
          const end: LatLng = [points.end.lat, points.end.lng]
          setEnd(end)
        }
      } catch (err) {
        console.error(err)
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
      },
    })

    return null
  }

  return (
    <div
      style={{
        height: "800px",
        width: "800px",
        border: "2px solid black",
        position: "relative",
        margin: "auto",
      }}
    >
      <MapContainer
        center={userLocation || [51.505, -0.09]} // fallback London
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {routes?.map((route, i) => (
          <Polyline key={i} positions={route} color="blue" />
        ))}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Show user location marker
        {userLocation && <Marker position={userLocation} icon={defaultIcon} />} */}

        {/* Show start and end markers */}
        {start && <Marker position={start} icon={defaultIcon} />}
        {end && <Marker position={end} icon={defaultIcon} />}

        <LocationSelector setStart={setStart} setEnd={setEnd} />
      </MapContainer>

      {/* Info box overlay */}
      <div
        style={{
          bottom: "10px",
          left: "10px",
          background: "white",
          padding: "6px 10px",
          borderRadius: "4px",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        <p>
          <b>Start:</b>{" "}
          {start
            ? `${start[0].toFixed(5)}, ${start[1].toFixed(5)}`
            : "Click map"}
        </p>
        <p>
          <b>End:</b>{" "}
          {end
            ? `${end[0].toFixed(5)}, ${end[1].toFixed(5)}`
            : "Click map again"}
        </p>
        <div>
          <button onClick={handleReset} style={{ marginRight: "10px" }}>
            Reset
          </button>
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>
      <RouteInfo directions={directionData} />
    </div>
  )
}
