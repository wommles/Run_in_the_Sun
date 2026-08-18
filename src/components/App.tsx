import { useEffect, useState, type CSSProperties } from "react"
import MapDropdownContainer from "./MapDropdownContainer"
import FullScreenMap from "./map/FullScreenMap"
import { BASEMAPS } from "./map/basemaps"
import { BasemapProvider, useBasemap } from "./map/BasemapContext"

const DEV_MODE_KEY = "rits-dev-mode"
const DEV_QUERY_EVENT = "rits:locationchange"

function hasDevQuery(): boolean {
  return new URLSearchParams(window.location.search).get("mode") === "dev"
}

function readDevMode(): boolean {
  try {
    return localStorage.getItem(DEV_MODE_KEY) === "true"
  } catch {
    return false
  }
}

function useDevQueryAccess() {
  const [allowed, setAllowed] = useState(hasDevQuery)

  useEffect(() => {
    const sync = () => setAllowed(hasDevQuery())

    window.addEventListener("popstate", sync)
    window.addEventListener(DEV_QUERY_EVENT, sync)

    const historyMethods = ["pushState", "replaceState"] as const
    const originals = historyMethods.map((method) => {
      const original = history[method]
      history[method] = function (...args: Parameters<History["pushState"]>) {
        const result = original.apply(this, args)
        window.dispatchEvent(new Event(DEV_QUERY_EVENT))
        return result
      }
      return { method, original }
    })

    return () => {
      window.removeEventListener("popstate", sync)
      window.removeEventListener(DEV_QUERY_EVENT, sync)
      for (const { method, original } of originals) {
        history[method] = original
      }
    }
  }, [])

  return allowed
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
  const showDevToggle = useDevQueryAccess()
  const isDevView = showDevToggle && devMode

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
      <div style={{ height: "100%", overflow: isDevView ? "auto" : "hidden" }}>
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
          {showDevToggle && (
            <DevModeToggle enabled={devMode} onToggle={toggleDevMode} />
          )}
          <BasemapRadio />
        </div>
        {isDevView ? <MapDropdownContainer /> : <FullScreenMap />}
      </div>
    </BasemapProvider>
  )
}
