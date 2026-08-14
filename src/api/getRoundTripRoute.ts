// src/getRoundTripRoute.ts

import { getRoute, type LatLng } from "./getRoute";
import type { ORSDirectionsResponse, RouteOptions } from "../types/directions";

/**
 * Fetches a round trip route from ORS using the main getRoute function
 * @param profile e.g. "foot-walking", "driving-car"
 * @param startPoint [lat, lng] - starting and ending point
 * @param lengthKm - desired route length in kilometers
 */
export async function getRoundTripRoute(
  profile: string,
  startPoint: LatLng, 
  lengthKm: number
): Promise<ORSDirectionsResponse> {
  const roundTripOptions: RouteOptions = {
    round_trip: {
      length: lengthKm * 1000, // Convert km to meters
      points: 5, // Number of intermediate points
      seed: Math.floor(Math.random() * 1000) // Add some randomization
    },
    // Example: For walking profiles, prefer green and quiet routes
    ...(profile.startsWith('foot-') && {
      profile_params: {
        weightings: {
          green: 0.8,   // Strongly prefer green areas
          quiet: 0.6,   // Moderately prefer quiet routes
          // shadow: 0.4   // Slightly prefer shaded routes (not supported by ORS)
        }
      }
    })
  };

  return getRoute(profile, startPoint, undefined, roundTripOptions);
}
