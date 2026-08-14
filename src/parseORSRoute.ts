// parseORSRoute.ts
import L from "leaflet";
import {
  SurfaceType,
  SurfaceTypeLabels,
  type ORSDirectionsResponse,
  type ORSRoute,
} from "./types/directions";

export interface RouteSurfaceSegment {
  positions: L.LatLng[]
  surfaceId: number
}

export interface RouteDrawerStats {
  distanceMeters: number
  ascentMeters?: number
  descentMeters?: number
  isRoundTrip?: boolean
  primarySurface?: string
  secondarySurface?: string
}

function decodeDelta(encoded: string, index: { value: number }): number {
  let b: number
  let shift = 0
  let result = 0
  do {
    b = encoded.charCodeAt(index.value++) - 63
    result |= (b & 0x1f) << shift
    shift += 5
  } while (b >= 0x20)
  return (result & 1) !== 0 ? ~(result >> 1) : result >> 1
}

/** ORS 3D encoded polyline: lat, lng, elevation. Elevation is ignored for the map. */
function decodeElevationPolyline(encoded: string): L.LatLng[] {
  const points: L.LatLng[] = []
  const index = { value: 0 }
  let lat = 0
  let lng = 0

  while (index.value < encoded.length) {
    lat += decodeDelta(encoded, index)
    lng += decodeDelta(encoded, index)
    decodeDelta(encoded, index)
    points.push(L.latLng(lat / 1e5, lng / 1e5))
  }

  return points
}

function coordinatesFromGeometry(geometry: ORSRoute["geometry"]): L.LatLng[] {
  if (typeof geometry === "string") {
    return decodeElevationPolyline(geometry)
  }
  if (geometry?.coordinates) {
    return geometry.coordinates.map(([lng, lat]) => L.latLng(lat, lng))
  }
  return []
}

function isKnownSurface(value: number): boolean {
  const label = SurfaceTypeLabels[value]
  return value !== SurfaceType.Unknown && label != null && label !== "Unknown"
}

export function getRouteDrawerStats(
  response: ORSDirectionsResponse
): RouteDrawerStats | undefined {
  const route = response.routes?.[0]
  if (!route?.summary) return undefined

  const knownSurfaces = [...(route.extras?.surface?.summary ?? [])]
    .filter((entry) => isKnownSurface(entry.value))
    .sort((a, b) => (b.distance ?? b.amount ?? 0) - (a.distance ?? a.amount ?? 0))

  const query = response.metadata?.query
  const isRoundTrip = Boolean(
    query?.options?.round_trip || query?.coordinates?.length === 1
  )

  return {
    distanceMeters: route.summary.distance,
    ascentMeters: route.summary.ascent,
    descentMeters: route.summary.descent,
    isRoundTrip,
    primarySurface: knownSurfaces[0]
      ? SurfaceTypeLabels[knownSurfaces[0].value]
      : undefined,
    secondarySurface: knownSurfaces[1]
      ? SurfaceTypeLabels[knownSurfaces[1].value]
      : undefined,
  }
}

// Function to parse ORS response to Leaflet LatLngs
export function parseORSRoute(response: ORSDirectionsResponse): L.LatLng[][] {
  if (!response.routes || response.routes.length === 0) return [];

  return response.routes.map(route => coordinatesFromGeometry(route.geometry));
}

export function parseORSRouteSurfaceSegments(
  response: ORSDirectionsResponse
): RouteSurfaceSegment[] {
  const coords = parseORSRoute(response)[0]
  if (!coords || coords.length === 0) return []

  const values = response.routes[0]?.extras?.surface?.values
  if (!values || values.length === 0) {
    return [{ positions: coords, surfaceId: 0 }]
  }

  const lastIndex = coords.length - 1
  return values.flatMap(([from, to, surfaceId]) => {
    const start = Math.max(0, Math.min(from, lastIndex))
    const end = Math.max(0, Math.min(to, lastIndex))
    if (end <= start) return []

    return [{
      positions: coords.slice(start, end + 1),
      surfaceId,
    }]
  })
}

// Optional: Get start and end points as Leaflet LatLng
export function getStartEndPoints(response: ORSDirectionsResponse): { start: L.LatLng; end: L.LatLng } | null {
  if (!response.routes || response.routes.length === 0) return null;

  const coords = parseORSRoute(response)[0];
  if (!coords || coords.length === 0) return null;

  return { start: coords[0], end: coords[coords.length - 1] };
}
