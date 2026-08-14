export interface WalkingProfileWeightings {
  green?: number;           // 0-1, prefer routes through green areas
  quiet?: number;           // 0-1, prefer quiet routes (low noise)
  shadow?: number;          // 0-1, prefer shaded routes
  steepness_difficulty?: number; // 0-3, steepness difficulty level (0=novice, 3=pro)
}

export interface RouteOptions {
  round_trip?: {
    length: number;
    points: number;
    seed?: number;
  };
  profile_params?: {
    weightings?: WalkingProfileWeightings;
    [key: string]: any; // Allow other profile-specific parameters
  };
}

export interface ORSDirectionsResponse {
    bbox: number[];
    routes: ORSRoute[];
    metadata: ORSMetadata;
  }
  
  export interface ORSRoute {
    summary: ORSSummary;
    segments: ORSSegment[];
    bbox: number[];
    geometry: string | { type: string; coordinates: number[][] }
    way_points: number[];
    warnings?: ORSWarning[];
    extras?: RouteExtras
    departure?: string;
    arrival?: string;
  }

  export type RouteExtra = {
    summary?: RouteExtraSummary[]
    values:  [number, number, number][]
  }

  export interface RouteExtraSummary {
    value: number
    distance: number
    amount: number
  }
  
  export type RouteExtras = {
    steepness?: RouteExtra                // Steepness IDs
    suitability?: RouteExtra              // 1–10 suitability score
    surface?: RouteExtra                  // Surface IDs
    waycategory?: RouteExtra              // Category IDs
    waytype?: RouteExtra                  // Type IDs
    tollways?: RouteExtra                 // 0 (no toll) / 1 (tollway)
    traildifficulty?: RouteExtra          // Trail difficulty IDs
    osmid?: RouteExtra                    // OSM way IDs
    roadaccessrestrictions?: RouteExtra   // Restrictions IDs
    countryinfo?: RouteExtra              // Country IDs
    green?: RouteExtra                    // 0–10 green score
    noise?: RouteExtra                    // 0–10 noise score
    shadow?: RouteExtra                   // 0–10 shadow/sun score
    csv?: RouteExtra                      // Experimental CSV-based extras
  }
  
  export interface ORSSummary {
    distance: number;   // meters
    duration: number;   // seconds
    ascent?: number;    // meters
    descent?: number;   // meters
    fare?: number;      // currency unit (when applicable)
  }
  
  export interface ORSSegment {
    distance: number;
    duration: number;
    steps: ORSStep[];
    detourfactor?: number;
    percentage?: number;
    avgspeed?: number;
    ascent?: number;
    descent?: number;
  }
  
  export interface ORSStep {
    distance: number;
    duration: number;
    type: number;
    instruction: string;
    name: string;
    way_points: number[];
    exit_number?: number;
    exit_bearings?: number[];
    maneuver?: ORSManeuver;
  }
  
  export interface ORSManeuver {
    location: number[]; // [lon, lat]
    bearing_before: number;
    bearing_after: number;
  }
  
  export interface ORSWarning {
    code: number;
    message: string;
  }
  
  export interface ORSMetadata {
    attribution: string;
    service: string;
    timestamp: number;
    id?: string;
    query: ORSQuery;
    engine: ORSEngine;
    system_message?: string;
  }
  
  export interface ORSQuery {
    coordinates: number[][];
    profile: string;
    format: string;
    [key: string]: any; // allows additional request options
  }
  
  export interface ORSEngine {
    version: string;
    build_date: string;
    graph_date?: string;
    osm_date?: string;
  }

  export const SurfaceType = {
    Unknown: 0,
    Paved: 1,
    Unpaved: 2,
    Asphalt: 3,
    Concrete: 4,
    Cobblestone: 5,
    Metal: 6,
    Wood: 7,
    CompactedGravel: 8,
    FineGravel: 9,
    Gravel: 10,
    Dirt: 11,
    Ground: 12,
    Ice: 13,
    PavingStones: 14,
    Sand: 15,
    Woodchips: 16,
    Grass: 17,
    GrassPaver: 18
  } as const;

  // Create reverse lookup array for efficient label conversion
  export const SurfaceTypeLabels = [
    "Unknown",        // 0
    "Paved",          // 1
    "Unpaved",        // 2
    "Asphalt",        // 3
    "Concrete",       // 4
    "Cobblestone",    // 5
    "Metal",          // 6
    "Wood",           // 7
    "Compacted Gravel", // 8
    "Fine Gravel",    // 9
    "Gravel",         // 10
    "Dirt",           // 11
    "Ground",         // 12
    "Ice",            // 13
    "Paving Stones",  // 14
    "Sand",           // 15
    "Woodchips",      // 16
    "Grass",          // 17
    "Grass Paver"     // 18
  ] as const;

  export type SurfaceTypeValue = typeof SurfaceType[keyof typeof SurfaceType];
  