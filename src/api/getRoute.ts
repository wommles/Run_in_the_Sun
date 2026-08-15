import type { ORSDirectionsResponse, RouteOptions } from "../types/directions";
import { ORS_BASE_URL } from "./orsConstants";

export type LatLng = [number, number];

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

export async function getRoute(
  profile: string,
  start: LatLng, 
  end?: LatLng,
  options?: RouteOptions
): Promise<ORSDirectionsResponse> {
  const coordinates = options?.round_trip 
    ? [[start[1], start[0]]]
    : [[start[1], start[0]], [end![1], end![0]]];

  const extraInfo = ["waycategory", "surface", "steepness", "traildifficulty", "suitability", "green", "noise" /* , "shadow" */];

  let body: any;

  if (options?.round_trip) {
    body = {
      coordinates,
      extra_info: extraInfo,
      elevation: true,
      options: { 
        round_trip: options.round_trip,
        ...(options.profile_params && { profile_params: options.profile_params })
      }
    };
    console.log("Round trip request body (extra_info at root):", JSON.stringify(body, null, 2));
  } else {
    body = {
      coordinates,
      extra_info: extraInfo,
      elevation: true,
      ...(options?.profile_params && { options: { profile_params: options.profile_params } })
    };
    console.log("A-to-B request body:", JSON.stringify(body, null, 2));
  }

  const headers: Record<string, string> = {
    Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
    "Content-Type": "application/json",
  };

  if (ORS_API_KEY) {
    headers.Authorization = ORS_API_KEY;
  }

  const response = await fetch(`${ORS_BASE_URL}/${profile}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`ORS request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.routes && result.routes[0]) {
    const route = result.routes[0];
    console.log("Available extras:", route.extras ? Object.keys(route.extras) : "none");
    if (route.extras?.surface) {
      console.log("Surface data found:", !!route.extras.surface.summary);
    } else {
      console.log("❌ No surface data in response");
    }
  }

  return result;
}
