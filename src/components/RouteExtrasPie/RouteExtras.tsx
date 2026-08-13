import { SurfacesPie } from "./SurfacesPie"
import type { ORSDirectionsResponse } from "../../types/directions"

interface RouteExtrasProps {
  directions: ORSDirectionsResponse | undefined
}

export default function RouteExtras({ directions }: RouteExtrasProps) {
  if (!directions || !directions.routes || directions.routes.length === 0) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#666",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <h3 style={{ marginBottom: "10px", color: "#999" }}>Route Analysis</h3>
          <p>Create a route to see detailed analysis and surface information.</p>
        </div>
      </div>
    )
  }

  const route = directions.routes[0]
  const extras = route.extras || {}

  return (
    <div
      style={{
        padding: "20px",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#333" }}>
        Route Analysis
      </h3>

      {/* Surface Analysis */}
      {extras.surface && extras.surface.summary ? (
        <div style={{ marginBottom: "30px" }}>
          <SurfacesPie summaries={extras.surface.summary} />
        </div>
      ) : (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            marginBottom: "20px",
            textAlign: "center",
            color: "#666",
          }}
        >
          <p style={{ margin: 0 }}>No surface data available for this route.</p>
        </div>
      )}

      {/* Placeholder for future route extras */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#e9ecef",
          borderRadius: "6px",
          color: "#6c757d",
          fontSize: "14px",
        }}
      >
        <p style={{ margin: 0, fontWeight: "500" }}>Coming Soon:</p>
        <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
          <li>Elevation profile</li>
          <li>Route difficulty analysis</li>
          <li>Way category breakdown</li>
          <li>Steepness information</li>
        </ul>
      </div>
    </div>
  )
}
