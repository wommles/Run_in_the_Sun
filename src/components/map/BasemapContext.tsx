import { createContext, useContext, useState, type ReactNode } from "react"
import { DEFAULT_BASEMAP_NAME } from "./basemaps"

interface BasemapContextValue {
  selectedName: string
  setSelectedName: (name: string) => void
}

const BasemapContext = createContext<BasemapContextValue | null>(null)

export function BasemapProvider({ children }: { children: ReactNode }) {
  const [selectedName, setSelectedName] = useState(DEFAULT_BASEMAP_NAME)

  return (
    <BasemapContext.Provider value={{ selectedName, setSelectedName }}>
      {children}
    </BasemapContext.Provider>
  )
}

export function useBasemap() {
  const context = useContext(BasemapContext)
  if (!context) {
    throw new Error("useBasemap must be used within a BasemapProvider")
  }
  return context
}
