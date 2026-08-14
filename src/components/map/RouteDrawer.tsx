import { useEffect, useRef, useState, type CSSProperties } from "react"
import type { RouteDrawerStats } from "../../parseORSRoute"

const DRAWER_HEIGHT_PX = 128

const statLabelStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#6c757d",
  marginBottom: "4px",
}

const statValueStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#212529",
  lineHeight: 1.2,
}

const iconButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  padding: 0,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#495057",
  borderRadius: "6px",
  flexShrink: 0,
}

function formatDistanceKm(meters: number): string {
  return (meters / 1000).toFixed(2)
}

function formatElevation(
  ascent?: number,
  descent?: number,
  ascentOnly = false
): string {
  if (ascentOnly) {
    return ascent != null ? `+${Math.round(ascent)} m` : "—"
  }

  const hasAscent = ascent != null
  const hasDescent = descent != null
  if (!hasAscent && !hasDescent) return "—"

  const parts: string[] = []
  if (hasAscent) parts.push(`+${Math.round(ascent)} m`)
  if (hasDescent) parts.push(`−${Math.round(descent)} m`)
  return parts.join(" / ")
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        fill="currentColor"
      />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
        fill="currentColor"
      />
    </svg>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
    </div>
  )
}

function DistanceStat({
  meters,
  disabled,
  onCommit,
}: {
  meters: number
  disabled?: boolean
  onCommit?: (lengthKm: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(formatDistanceKm(meters))

  const skipCommitRef = useRef(false)

  useEffect(() => {
    if (!editing) {
      setDraft(formatDistanceKm(meters))
    }
  }, [meters, editing])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commit = () => {
    if (skipCommitRef.current) {
      skipCommitRef.current = false
      return
    }
    const parsed = Number.parseFloat(draft)
    setEditing(false)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setDraft(formatDistanceKm(meters))
      return
    }
    const lengthKm = Math.min(50, Math.max(0.5, parsed))
    setDraft(lengthKm.toFixed(2))
    onCommit?.(lengthKm)
  }

  const cancel = () => {
    skipCommitRef.current = true
    setDraft(formatDistanceKm(meters))
    setEditing(false)
  }

  return (
    <div style={{ minWidth: 0 }}>
      <div style={statLabelStyle}>Distance</div>
      {editing ? (
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <input
            ref={inputRef}
            type="number"
            min={0.5}
            max={50}
            step={0.1}
            value={draft}
            disabled={disabled}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur()
              }
              if (e.key === "Escape") {
                e.preventDefault()
                cancel()
              }
            }}
            aria-label="Route distance in kilometres"
            style={{
              ...statValueStyle,
              width: "4.5rem",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              padding: "2px 6px",
              fontFamily: "inherit",
            }}
          />
          <span style={{ ...statValueStyle, fontSize: "14px", color: "#6c757d" }}>km</span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={statValueStyle}>{formatDistanceKm(meters)} km</div>
          {onCommit && (
            <button
              type="button"
              title="Edit distance"
              aria-label="Edit distance"
              disabled={disabled}
              onClick={() => setEditing(true)}
              style={{
                ...iconButtonStyle,
                width: "24px",
                height: "24px",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <PencilIcon />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export { DRAWER_HEIGHT_PX }

export default function RouteDrawer({
  stats,
  isRefreshing,
  onRefresh,
  onDistanceChange,
}: {
  stats: RouteDrawerStats
  isRefreshing?: boolean
  onRefresh?: () => void
  onDistanceChange?: (lengthKm: number) => void
}) {
  return (
    <div
      className="route-drawer"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1100,
        background: "white",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.18)",
        padding: "10px 16px 16px 20px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "4px",
          borderRadius: "2px",
          background: "#ced4da",
          margin: "0 auto 12px",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "12px 16px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <DistanceStat
            meters={stats.distanceMeters}
            disabled={isRefreshing}
            onCommit={onDistanceChange}
          />
          <Stat
            label="Elevation"
            value={formatElevation(
              stats.ascentMeters,
              stats.descentMeters,
              stats.isRoundTrip
            )}
          />
          <Stat label="Primary surface" value={stats.primarySurface ?? "—"} />
          <Stat label="Secondary surface" value={stats.secondarySurface ?? "—"} />
        </div>
        {onRefresh && (
          <button
            type="button"
            title="Generate a new route"
            aria-label="Generate a new route"
            disabled={isRefreshing}
            onClick={onRefresh}
            style={{
              ...iconButtonStyle,
              width: "40px",
              height: "40px",
              background: "#f8f9fa",
              border: "1px solid #dee2e6",
              opacity: isRefreshing ? 0.6 : 1,
              cursor: isRefreshing ? "not-allowed" : "pointer",
            }}
          >
            <RefreshIcon />
          </button>
        )}
      </div>
    </div>
  )
}
