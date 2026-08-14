export interface Basemap {
  name: string
  url: string
  attribution: string
  maxZoom: number
}

const STADIA_API_KEY = import.meta.env.VITE_STADIA_API_KEY
const stadiaQuery = STADIA_API_KEY ? `?api_key=${STADIA_API_KEY}` : ""

const STADIA_ATTR =
  '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
  '&copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> ' +
  '&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'

const WATERCOLOR_ATTR =
  '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
  '&copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'

const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export const DEFAULT_BASEMAP_NAME = "Stamen Terrain"

export const BASEMAPS: Basemap[] = [
  {
    name: "OSM",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: OSM_ATTR,
    maxZoom: 19,
  },
  {
    name: "Stamen Terrain",
    url: `https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png${stadiaQuery}`,
    attribution: STADIA_ATTR,
    maxZoom: 18,
  },
  {
    name: "Stamen Watercolour",
    url: `https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg${stadiaQuery}`,
    attribution: WATERCOLOR_ATTR,
    maxZoom: 16,
  },
]

export function getBasemap(name: string): Basemap {
  return (
    BASEMAPS.find((layer) => layer.name === name) ??
    BASEMAPS.find((layer) => layer.name === DEFAULT_BASEMAP_NAME)!
  )
}
