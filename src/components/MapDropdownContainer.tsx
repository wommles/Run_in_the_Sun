import { useState } from "react"
import AtoBMap from "./map/AtoBMap"
import RoundTripMap from "./map/RoundTripMap"
import RouteExtras from "./RouteExtrasPie/RouteExtras"
import type { ORSDirectionsResponse } from "../types/directions"

interface DropdownCardProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}

function DropdownCard({ title, children, isOpen, onToggle }: DropdownCardProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginBottom: "16px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#f8f9fa",
          borderBottom: isOpen ? "1px solid #ddd" : "none",
          borderRadius: isOpen ? "8px 8px 0 0" : "8px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          userSelect: "none",
        }}
        onClick={onToggle}
      >
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
          {title}
        </h3>
        <span
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          ▼
        </span>
      </div>

      {/* Content */}
      {isOpen && (
        <div
          style={{
            padding: "16px",
            borderRadius: "0 0 8px 8px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export default function MapDropdownContainer() {
  const [isAtoBOpen, setIsAtoBOpen] = useState(false)
  const [isRoundTripOpen, setIsRoundTripOpen] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [currentRouteData, setCurrentRouteData] = useState<ORSDirectionsResponse | undefined>(undefined)

  const handleRouteData = (data: ORSDirectionsResponse | undefined) => {
    setCurrentRouteData(data)
    if (data && !isSidePanelOpen) {
      setIsSidePanelOpen(true) // Auto-open side panel when route is created
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Main Content Area */}
      <div
        style={{
          flex: isSidePanelOpen ? "1" : "1",
          maxWidth: isSidePanelOpen ? "calc(100% - 400px)" : "900px",
          margin: "20px auto",
          padding: "0 20px",
          transition: "max-width 0.3s ease",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#333",
            fontSize: "28px",
          }}
        >
          RITS Tester - OpenRouteService
        </h1>

        {/* A-to-B Route Card */}
        <DropdownCard
          title="A-to-B Route Planning"
          isOpen={isAtoBOpen}
          onToggle={() => {
            setIsAtoBOpen(!isAtoBOpen)
            // Close the other dropdown when opening this one
            if (!isAtoBOpen && isRoundTripOpen) {
              setIsRoundTripOpen(false)
            }
          }}
        >
          <div style={{ marginBottom: "10px", color: "#666" }}>
            Plan a route between two points. Click on the map to select your start and end locations.
          </div>
          <AtoBMap onRouteData={handleRouteData} />
        </DropdownCard>

        {/* Round Trip Route Card */}
        <DropdownCard
          title="Round Trip Route Planning"
          isOpen={isRoundTripOpen}
          onToggle={() => {
            setIsRoundTripOpen(!isRoundTripOpen)
            // Close the other dropdown when opening this one
            if (!isRoundTripOpen && isAtoBOpen) {
              setIsAtoBOpen(false)
            }
          }}
        >
          <div style={{ marginBottom: "10px", color: "#666" }}>
            Create a round trip route starting and ending at the same point. Click on the map to select your starting location and set the desired route length.
          </div>
          <RoundTripMap onRouteData={handleRouteData} />
        </DropdownCard>

        {/* Instructions */}
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h4 style={{ marginTop: 0, color: "#495057" }}>How to Use:</h4>
          <ul style={{ marginBottom: 0, color: "#6c757d" }}>
            <li><strong>A-to-B Routes:</strong> Click to expand, then click two points on the map to create a route between them.</li>
            <li><strong>Round Trip Routes:</strong> Click to expand, then click one point on the map and set your desired route length.</li>
            <li><strong>Route Analysis:</strong> View detailed route information in the side panel (opens automatically when a route is created).</li>
            <li><strong>Surface Data:</strong> See surface type distribution for your planned route.</li>
          </ul>
        </div>
      </div>

      {/* Side Panel */}
      <div
        style={{
          width: isSidePanelOpen ? "400px" : "0px",
          backgroundColor: "#fff",
          borderLeft: "1px solid #ddd",
          boxShadow: "-2px 0 4px rgba(0,0,0,0.1)",
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          overflow: "hidden",
          transition: "width 0.3s ease",
          zIndex: 1000,
        }}
      >
        {/* Side Panel Header */}
        <div
          style={{
            padding: "15px 20px",
            borderBottom: "1px solid #e9ecef",
            backgroundColor: "#f8f9fa",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4 style={{ margin: 0, color: "#495057", fontSize: "16px" }}>
            Route Analysis
          </h4>
          <button
            onClick={() => setIsSidePanelOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              padding: "0",
              color: "#6c757d",
            }}
            title="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Side Panel Content */}
        <div style={{ height: "calc(100vh - 60px)" }}>
          <RouteExtras directions={currentRouteData} />
        </div>
      </div>

      {/* Side Panel Toggle Button (when panel is closed) */}
      {!isSidePanelOpen && currentRouteData && (
        <button
          onClick={() => setIsSidePanelOpen(true)}
          style={{
            position: "fixed",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px 0 0 6px",
            padding: "12px 8px",
            cursor: "pointer",
            boxShadow: "-2px 0 4px rgba(0,0,0,0.1)",
            zIndex: 999,
            fontSize: "14px",
            fontWeight: "500",
          }}
          title="Open route analysis"
        >
          📊
        </button>
      )}
    </div>
  )
}
