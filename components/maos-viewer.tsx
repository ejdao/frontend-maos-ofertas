"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetchData } from "@/lib/api"
import type { Set, Categoria, Clasificacion } from "@/lib/types"
import { Sidebar } from "@/components/sidebar"
import { SetDetail } from "@/components/set-detail"
import { WelcomeView } from "@/components/welcome-view"
import { LoadingState, ErrorState } from "@/components/loading-error"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MaosViewer() {
  const { data, error, isLoading, mutate } = useSWR("maos-data", fetchData, {
    revalidateOnFocus: false,
  })

  const [selectedSet, setSelectedSet] = useState<Set | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)
  const [selectedClasificacion, setSelectedClasificacion] = useState<Clasificacion | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSelectSet = (set: Set, categoria: Categoria, clasificacion: Clasificacion) => {
    setSelectedSet(set)
    setSelectedCategoria(categoria)
    setSelectedClasificacion(clasificacion)
    setSidebarOpen(false)
  }

  if (isLoading) {
    return <LoadingState message="Cargando datos desde el servidor..." />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => mutate()} />
  }

  if (!data || data.length === 0) {
    return <ErrorState message="No se encontraron datos" onRetry={() => mutate()} />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar data={data} selectedSet={selectedSet} onSelectSet={handleSelectSet} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {selectedSet && selectedCategoria && selectedClasificacion ? (
          <SetDetail
            set={selectedSet}
            categoria={selectedCategoria}
            clasificacion={selectedClasificacion}
          />
        ) : (
          <WelcomeView data={data} />
        )}
      </main>
    </div>
  )
}
