// parseORSRoute.ts
import L from "leaflet";
import polyline from '@mapbox/polyline'
import type { ORSDirectionsResponse } from "./types/directions";

// Function to parse ORS response to Leaflet LatLngs
export function parseORSRoute(response: ORSDirectionsResponse): L.LatLng[][] {
  if (!response.routes || response.routes.length === 0) return [];

  return response.routes.map(route => {
    // Decode polyline from ORS (encoded polyline is in 'geometry')
    // Leaflet uses [lat, lng], but ORS polyline decoder returns [lat, lng] by default
    // We'll use @mapbox/polyline to decode
    const latlngsArray = polyline.decode(route.geometry).map(([lat, lng]) => L.latLng(lat, lng));
    return latlngsArray;
  });
}

// Optional: Get start and end points as Leaflet LatLng
export function getStartEndPoints(response: ORSDirectionsResponse): { start: L.LatLng; end: L.LatLng } | null {
  if (!response.routes || response.routes.length === 0) return null;

  const coords = parseORSRoute(response)[0];
  if (!coords || coords.length === 0) return null;

  return { start: coords[0], end: coords[coords.length - 1] };
}
