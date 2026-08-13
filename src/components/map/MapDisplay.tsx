import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Default Leaflet marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

type LatLng = [number, number]

export interface MapMarker {
  position: LatLng
  icon?: L.Icon
}

interface MapDisplayProps {
  userLocation?: LatLng | null
  routes?: L.LatLng[][]
  markers?: MapMarker[]
  children?: React.ReactNode
  center?: LatLng
  zoom?: number
  style?: React.CSSProperties
  containerStyle?: React.CSSProperties
}

export default function MapDisplay({
  userLocation,
  routes,
  markers = [],
  children,
  center,
  zoom = 13,
  style = { height: "100%", width: "100%" },
  containerStyle = {
    height: "800px",
    width: "800px",
    border: "2px solid black",
    position: "relative",
    margin: "auto",
  }
}: MapDisplayProps) {
  const mapCenter = center || userLocation || [51.505, -0.09] // fallback London

  return (
    <div style={containerStyle}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={style}
      >
        {/* Display route polylines */}
        {routes?.map((route, i) => (
          <Polyline key={i} positions={route} color="blue" weight={4} />
        ))}
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Show markers */}
        {markers.map((marker, i) => (
          <Marker 
            key={i}
            position={marker.position} 
            icon={marker.icon || defaultIcon}
          />
        ))}

        {/* Custom children (like click handlers, etc.) */}
        {children}
      </MapContainer>
    </div>
  )
}

// Export the default icon for use in parent components
export { defaultIcon }
