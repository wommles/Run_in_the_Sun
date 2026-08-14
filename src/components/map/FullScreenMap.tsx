import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import MapDisplay, { type MapMarker } from "./MapDisplay"
import { getRoundTripRoute } from "../../api/getRoundTripRoute"
import {
  parseORSRoute,
  parseORSRouteSurfaceSegments,
  getRouteDrawerStats,
  type RouteSurfaceSegment,
  type RouteDrawerStats,
} from "../../parseORSRoute"

type LatLng = [number, number]

const FALLBACK_START: LatLng = [51.539048, -0.162457]
const DEFAULT_ROUTE_KM = 5
const DEFAULT_PROFILE = "foot-walking"
const CLICK_DRAG_TOLERANCE_PX = 5

function MapViewController({
  position,
  routes,
}: {
  position: LatLng
  routes?: L.LatLng[][]
}) {
  const map = useMap()

  useEffect(() => {
    const points = routes?.flat() ?? []
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], paddingBottomRight: [40, 160] })
    } else {
      map.setView(position, map.getZoom())
    }
    map.invalidateSize()
  }, [map, position, routes])

  return null
}

function RouteFromPointPrompt({
  onConfirm,
}: {
  onConfirm: (point: LatLng) => void
}) {
  const map = useMap()
  const downPoint = useRef<L.Point | null>(null)
  const [prompt, setPrompt] = useState<{
    latlng: LatLng
    x: number
    y: number
  } | null>(null)

  const popupRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    L.DomEvent.disableClickPropagation(node)
    L.DomEvent.disableScrollPropagation(node)
  }, [])

  useMapEvents({
    mousedown(e) {
      downPoint.current = e.containerPoint
    },
    click(e) {
      const target = e.originalEvent.target as HTMLElement | null
      if (target?.closest(".leaflet-control, .route-from-point-popup")) return

      const down = downPoint.current
      if (down && down.distanceTo(e.containerPoint) > CLICK_DRAG_TOLERANCE_PX) {
        return
      }

      setPrompt({
        latlng: [e.latlng.lat, e.latlng.lng],
        x: e.containerPoint.x,
        y: e.containerPoint.y,
      })
    },
    move() {
      setPrompt((current) => {
        if (!current) return current
        const point = map.latLngToContainerPoint(current.latlng)
        return { ...current, x: point.x, y: point.y }
      })
    },
  })

  if (!prompt) return null

  return createPortal(
    <div
      ref={popupRef}
      className="route-from-point-popup"
      style={{
        position: "absolute",
        left: prompt.x,
        top: prompt.y,
        transform: "translate(12px, 8px)",
        zIndex: 1200,
        background: "white",
        padding: "12px 14px",
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
        border: "1px solid #ddd",
        minWidth: "220px",
        color: "#333",
        fontSize: "14px",
        fontWeight: 600,
        pointerEvents: "auto",
      }}
    >
      <div style={{ marginBottom: "10px", lineHeight: 1.35 }}>
        Generate route from this point?
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <button
          type="button"
          onClick={() => setPrompt(null)}
          style={{
            background: "white",
            color: "#333",
            border: "1px solid #ced4da",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            const point = prompt.latlng
            setPrompt(null)
            onConfirm(point)
          }}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Yes
        </button>
      </div>
    </div>,
    map.getContainer()
  )
}

function resolveStart(): Promise<LatLng> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(FALLBACK_START)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve([pos.coords.latitude, pos.coords.longitude])
      },
      (err) => {
        console.error("Geolocation error:", err)
        resolve(FALLBACK_START)
      }
    )
  })
}

export default function FullScreenMap() {
  const [start, setStart] = useState<LatLng>(FALLBACK_START)
  const [routes, setRoutes] = useState<L.LatLng[][]>()
  const [routeSegments, setRouteSegments] = useState<RouteSurfaceSegment[]>()
  const [routeStats, setRouteStats] = useState<RouteDrawerStats>()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const requestIdRef = useRef(0)
  const lengthRef = useRef(DEFAULT_ROUTE_KM)

  const loadRoute = useCallback(async (startPoint: LatLng, lengthKm: number) => {
    const requestId = ++requestIdRef.current
    setIsRefreshing(true)
    try {
      const data = await getRoundTripRoute(
        DEFAULT_PROFILE,
        startPoint,
        lengthKm
      )
      if (requestId !== requestIdRef.current) return
      setRoutes(parseORSRoute(data))
      setRouteSegments(parseORSRouteSurfaceSegments(data))
      setRouteStats(getRouteDrawerStats(data))
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      console.error("Failed to load round trip:", err)
    } finally {
      if (requestId === requestIdRef.current) {
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const startPoint = await resolveStart()
      if (cancelled) return
      setStart(startPoint)
      await loadRoute(startPoint, DEFAULT_ROUTE_KM)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [loadRoute])

  const handleRefresh = () => {
    if (isRefreshing) return
    void loadRoute(start, lengthRef.current)
  }

  const handleDistanceChange = (lengthKm: number) => {
    if (isRefreshing) return
    lengthRef.current = lengthKm
    void loadRoute(start, lengthKm)
  }

  const handleRouteFromPoint = (point: LatLng) => {
    setStart(point)
    void loadRoute(point, lengthRef.current)
  }

  const markers: MapMarker[] = [{ position: start }]

  return (
    <MapDisplay
      userLocation={start}
      routes={routes}
      routeSegments={routeSegments}
      routeStats={routeStats}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      onDistanceChange={handleDistanceChange}
      markers={markers}
      containerStyle={{
        height: "100%",
        width: "100%",
        position: "relative",
        margin: 0,
        border: "none",
      }}
    >
      <MapViewController position={start} routes={routes} />
      <RouteFromPointPrompt onConfirm={handleRouteFromPoint} />
    </MapDisplay>
  )
}
