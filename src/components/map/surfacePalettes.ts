export type SurfaceGroup = "unknown" | "natural" | "loose" | "mixed" | "paved"

const SURFACE_GROUP_BY_ID: SurfaceGroup[] = [
  "unknown", // Unknown
  "paved",   // Paved
  "natural", // Unpaved
  "paved",   // Asphalt
  "paved",   // Concrete
  "mixed",   // Cobblestone
  "mixed",   // Metal
  "mixed",   // Wood
  "loose",   // Compacted gravel
  "loose",   // Fine gravel
  "loose",   // Gravel
  "natural", // Dirt
  "natural", // Ground
  "natural", // Ice
  "paved",   // Paving stones
  "loose",   // Sand
  "loose",   // Woodchips
  "natural", // Grass
  "mixed",   // Grass paver
]

const BASEMAP_SURFACE_PALETTES: Record<string, Record<SurfaceGroup, string>> = {
  // Listed order: fuchsia-flame, electric-aqua, lime-cream, powder-blush, vibrant-coral
  // Paved uses the first colour, matching OSM / Watercolour.
  "Stamen Terrain": {
    paved: "#e2277e", // fuchsia-flame
    unknown: "#45e2ed", // electric-aqua
    natural: "#e2f395", // lime-cream
    mixed: "#fdb4aa", // powder-blush
    loose: "#fa6866", // vibrant-coral
  },
  // Listed order: electric-aqua, icy-aqua, old-rose, berry-lipstick, saddle-brown
  OSM: {
    paved: "#8cf2ff", // electric-aqua
    unknown: "#01161e",
    natural: "#d1809b", // old-rose
    mixed: "#c70e64", // berry-lipstick
    loose: "#743410", // saddle-brown
  },
  // Listed order: ink-black, dark-teal, air-force-blue, ash-grey, beige
  "Stamen Watercolour": {
    paved: "#01161e", // ink-bsdflack
    mixed: "#124559", // dark-teal
    loose: "#598392", // air-force-blue
    unknown: "#aec3b0", // ash-grey
    natural: "#eff6e0", // beige
  },
}

function getSurfaceGroup(surfaceId: number): SurfaceGroup {
  return SURFACE_GROUP_BY_ID[surfaceId] ?? "unknown"
}

export const SURFACE_GROUP_LABELS: Record<SurfaceGroup, string> = {
  paved: "Paved",
  mixed: "Mixed",
  loose: "Loose",
  natural: "Natural",
  unknown: "Unknown",
}

export const SURFACE_GROUP_ORDER: SurfaceGroup[] = [
  "paved",
  "mixed",
  "loose",
  "natural",
  "unknown",
]

export { getSurfaceGroup }

export function getSurfaceColor(surfaceId: number, basemapName: string): string {
  const palette =
    BASEMAP_SURFACE_PALETTES[basemapName] ?? BASEMAP_SURFACE_PALETTES["Stamen Terrain"]
  return palette[getSurfaceGroup(surfaceId)]
}
