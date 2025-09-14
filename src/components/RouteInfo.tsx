// RouteInfo.tsx
import React from "react"
import { SurfaceType, type ORSDirectionsResponse } from "../types/directions"
import { RouteExtrasPie } from "./RouteExtrasPie"
import { SurfacesPie } from "./RouteExtrasPie/SurfacesPie"

export const RouteInfo = ({
  directions,
}: {
  directions: ORSDirectionsResponse
}) => {
  if (!directions || !directions.routes || directions.routes.length === 0) {
    return <div>No route data available.</div>
  }

  const route = directions.routes[0]
  const summary = route.summary || {}
  const extras = route.extras || {}

  // Distance and time
  const distanceKm = summary.distance
    ? (summary.distance / 1000).toFixed(2)
    : "0"
  const durationMin = summary.duration
    ? (summary.duration / 60).toFixed(1)
    : "0"

  // Junctions = number of steps (first segment only)
  const numJunctions = route.segments?.[0]?.steps?.length || 0

  const wayCategories = extras.waycategory?.values || []
  const steepness = extras.steepness?.values || []
  const trailDifficulty = extras.traildifficulty?.values || []

  return (
    <div
      style={{
        padding: "10px",
        border: "1px solid #ccc",
        marginTop: "10px",
        borderRadius: "6px",
        background: "#fafafa",
      }}
    >
      <h3>Route Information</h3>
      <p>
        <b>Distance:</b> {distanceKm} km
      </p>
      <p>
        <b>Duration:</b> {durationMin} minutes
      </p>
      <p>
        <b>Junctions crossed:</b> {numJunctions}
      </p>

      {/* Road categories */}
      {wayCategories.length > 0 && (
        <div>
          <b>Road Categories:</b>
          <ul>
            {wayCategories.map((val, i) => (
              <li key={i}>
                From {val[0]} to {val[1]} → Category {val[2]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Surfaces */}
      {extras.surface && (
        <div>
          <b>Surfaces:</b>
          {extras.surface.summary && (
            <SurfacesPie summaries={extras.surface.summary} />
          )}
        </div>
      )}

      {/* Steepness */}
      {steepness.length > 0 && (
        <div>
          <b>Steepness Segments:</b>
          <ul>
            {steepness.map((val, i) => (
              <li key={i}>
                From {val[0]} to {val[1]} → Index {val[2]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Trail Difficulty */}
      {trailDifficulty.length > 0 && (
        <div>
          <b>Trail Difficulty:</b>
          <ul>
            {trailDifficulty.map((val, i) => (
              <li key={i}>
                From {val[0]} to {val[1]} → Difficulty {val[2]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
