import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { getBasemap } from "./basemaps"
import { useBasemap } from "./BasemapContext"
import type { RouteSurfaceSegment } from "../../parseORSRoute"
import {
  getSurfaceColor,
  getSurfaceGroup,
  SURFACE_GROUP_LABELS,
  SURFACE_GROUP_ORDER,
} from "./surfacePalettes"
import RouteDrawer from "./RouteDrawer"
import type { RouteDrawerStats } from "../../parseORSRoute"
import type { RoutePreferences } from "../../api/orsConstants"

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
  routeSegments?: RouteSurfaceSegment[]
  routeStats?: RouteDrawerStats
  isRefreshing?: boolean
  onRefresh?: () => void
  onDistanceChange?: (lengthKm: number) => void
  preferences: RoutePreferences
  onPreferencesChange: (preferences: RoutePreferences) => void
  markers?: MapMarker[]
  children?: React.ReactNode
  center?: LatLng
  zoom?: number
  style?: React.CSSProperties
  containerStyle?: React.CSSProperties
}

function SurfaceLegend({
  segments,
  basemapName,
  hasDrawer,
}: {
  segments: RouteSurfaceSegment[]
  basemapName: string
  hasDrawer: boolean
}) {
  const unique = new Map<string, string>()
  for (const segment of segments) {
    const group = getSurfaceGroup(segment.surfaceId)
    if (!unique.has(group)) {
      unique.set(group, getSurfaceColor(segment.surfaceId, basemapName))
    }
  }

  if (unique.size === 0) return null

  const entries = SURFACE_GROUP_ORDER
    .filter((group) => unique.has(group))
    .map((group) => [group, unique.get(group)!] as const)

  return (
    <div
      key={basemapName}
      className={hasDrawer ? "surface-legend with-drawer" : "surface-legend"}
      style={{
        position: "absolute",
        left: "10px",
        bottom: hasDrawer ? undefined : "24px",
        zIndex: 1000,
        background: "white",
        padding: "8px 10px",
        borderRadius: "6px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        fontSize: "12px",
        lineHeight: 1.4,
        maxHeight: "40%",
        overflowY: "auto",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "6px" }}>Surface</div>
      {entries.map(([group, color]) => (
        <div
          key={`${basemapName}-${group}`}
          style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}
        >
          <span
            style={{
              width: "14px",
              height: "4px",
              backgroundColor: color,
              borderRadius: "2px",
              flexShrink: 0,
            }}
          />
          <span>{SURFACE_GROUP_LABELS[group]}</span>
        </div>
      ))}
    </div>
  )
}

export default function MapDisplay({
  userLocation,
  routes,
  routeSegments,
  routeStats,
  isRefreshing,
  onRefresh,
  onDistanceChange,
  preferences,
  onPreferencesChange,
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
  const coloredSegments = routeSegments?.length ? routeSegments : undefined
  const { selectedName } = useBasemap()
  const basemap = getBasemap(selectedName)

  return (
    <div
      className={routeStats ? "map-with-drawer" : undefined}
      style={containerStyle}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={style}
      >
        {coloredSegments
          ? coloredSegments.map((segment, i) => {
              const color = getSurfaceColor(segment.surfaceId, selectedName)
              return (
                <Polyline
                  key={`${selectedName}-${i}-${segment.surfaceId}`}
                  positions={segment.positions}
                  pathOptions={{ color, weight: 5 }}
                />
              )
            })
          : routes?.map((route, i) => {
              const color = getSurfaceColor(0, selectedName)
              return (
                <Polyline
                  key={`${selectedName}-route-${i}`}
                  positions={route}
                  pathOptions={{ color, weight: 4 }}
                />
              )
            })}
        
        <TileLayer
          key={basemap.name}
          url={basemap.url}
          attribution={basemap.attribution}
          maxZoom={basemap.maxZoom}
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
      {coloredSegments && (
        <SurfaceLegend
          key={selectedName}
          segments={coloredSegments}
          basemapName={selectedName}
          hasDrawer={!!routeStats}
        />
      )}
      {routeStats && (
        <RouteDrawer
          stats={routeStats}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          onDistanceChange={onDistanceChange}
          preferences={preferences}
          onPreferencesChange={onPreferencesChange}
        />
      )}
    </div>
  )
}

// Export the default icon for use in parent components
export { defaultIcon }
