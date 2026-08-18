// src/getRoundTripRoute.ts

import { getRoute, type LatLng } from "./getRoute";
import type { ORSDirectionsResponse, RouteOptions } from "../types/directions";
import {
  DEFAULT_ROUTE_PREFERENCES,
  toProfileParams,
  type RoutePreferences,
} from "./orsConstants";

/**
 * Fetches a round trip route from ORS using the main getRoute function
 * @param profile e.g. "foot-walking", "driving-car"
 * @param startPoint [lat, lng] - starting and ending point
 * @param lengthKm - desired route length in kilometers
 */
export async function getRoundTripRoute(
  profile: string,
  startPoint: LatLng, 
  lengthKm: number,
  preferences: RoutePreferences = DEFAULT_ROUTE_PREFERENCES
): Promise<ORSDirectionsResponse> {
  const roundTripOptions: RouteOptions = {
    round_trip: {
      length: lengthKm * 1000, // Convert km to meters
      points: 5, // Number of intermediate points
      seed: Math.floor(Math.random() * 1000) // Add some randomization
    },
    profile_params: toProfileParams(preferences),
  };

  return getRoute(profile, startPoint, undefined, roundTripOptions);
}
