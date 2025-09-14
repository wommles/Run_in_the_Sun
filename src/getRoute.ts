// src/api/ors.ts

import type { ORSDirectionsResponse } from "./types/directions";

export type LatLng = [number, number];

const ORS_BASE_URL = "http://localhost:8080/ors/v2/directions";

/**
 * Fetches a route from ORS
 * @param profile e.g. "foot-walking", "driving-car"
 * @param start [lat, lng]
 * @param end [lat, lng]
 */
export async function getRoute(
  profile: string,
  start: LatLng, 
  end: LatLng
): Promise<ORSDirectionsResponse> {
  // ORS requires [lon, lat] order!
  const body = {
    coordinates: [
      [start[1], start[0]], // [lon, lat]
      [end[1], end[0]],     // [lon, lat]
    ],
    "extra_info":["waycategory", "surface","steepness","traildifficulty"]

  };

  const response = await fetch(`${ORS_BASE_URL}/${profile}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`ORS request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
