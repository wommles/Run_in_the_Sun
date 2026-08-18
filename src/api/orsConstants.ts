export const ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions";

export const DEFAULT_ROUTE_PREFERENCES = {
  green: 0.5,
  quiet: 0.5,
};

export type RoutePreferences = {
  green: number;
  quiet: number;
};

export function toProfileParams(preferences: RoutePreferences) {
  return {
    weightings: {
      green: preferences.green,
      quiet: preferences.quiet,
    },
  };
}
