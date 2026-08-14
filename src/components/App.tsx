import { useState, type CSSProperties } from "react"
import MapDropdownContainer from "./MapDropdownContainer"
import FullScreenMap from "./map/FullScreenMap"
import { BASEMAPS } from "./map/basemaps"
import { BasemapProvider, useBasemap } from "./map/BasemapContext"

const DEV_MODE_KEY = "rits-dev-mode"

function readDevMode(): boolean {
  try {
    return localStorage.getItem(DEV_MODE_KEY) === "true"
  } catch {
    return false
  }
}

const overlayCardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "white",
  padding: "8px 12px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  userSelect: "none",
  fontSize: "13px",
  fontWeight: 600,
  color: "#333",
  border: "1px solid #ddd",
}

function DevModeToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <label
      style={{
        ...overlayCardStyle,
        cursor: "pointer",
      }}
    >
      Dev Mode
      <input
        type="checkbox"
        checked={enabled}
        onChange={onToggle}
        style={{ cursor: "pointer" }}
      />
    </label>
  )
}

function BasemapRadio() {
  const { selectedName, setSelectedName } = useBasemap()

  return (
    <fieldset
      style={{
        ...overlayCardStyle,
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "6px",
        margin: 0,
        minWidth: "180px",
      }}
    >
      <legend
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        Basemap
      </legend>
      {BASEMAPS.map((layer) => (
        <label
          key={layer.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <input
            type="radio"
            name="basemap"
            value={layer.name}
            checked={selectedName === layer.name}
            onChange={() => setSelectedName(layer.name)}
            style={{ cursor: "pointer" }}
          />
          {layer.name}
        </label>
      ))}
    </fieldset>
  )
}

export default function App() {
  const [devMode, setDevMode] = useState(readDevMode)

  const toggleDevMode = () => {
    setDevMode((prev) => {
      const next = !prev
      try {
        localStorage.setItem(DEV_MODE_KEY, String(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  return (
    <BasemapProvider>
      <div style={{ height: "100%", overflow: devMode ? "auto" : "hidden" }}>
        <div
          style={{
            position: "fixed",
            top: "12px",
            right: "12px",
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
          }}
        >
          <DevModeToggle enabled={devMode} onToggle={toggleDevMode} />
          <BasemapRadio />
        </div>
        {devMode ? <MapDropdownContainer /> : <FullScreenMap />}
      </div>
    </BasemapProvider>
  )
}
