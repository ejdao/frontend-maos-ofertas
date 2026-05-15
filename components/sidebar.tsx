"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen, Package, Layers } from "lucide-react"
import type { Categoria, Clasificacion, Set } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SidebarProps {
  data: Categoria[]
  selectedSet: Set | null
  onSelectSet: (set: Set, categoria: Categoria, clasificacion: Clasificacion) => void
}

interface TreeItemProps {
  label: string
  icon?: React.ReactNode
  isOpen?: boolean
  isSelected?: boolean
  onClick?: () => void
  onToggle?: () => void
  hasChildren?: boolean
  level?: number
  children?: React.ReactNode
}

function TreeItem({
  label,
  icon,
  isOpen = false,
  isSelected = false,
  onClick,
  onToggle,
  hasChildren = false,
  level = 0,
  children,
}: TreeItemProps) {
  return (
    <div>
      <button
        className={cn(
          "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary text-left",
          isSelected && "bg-secondary text-primary",
          !isSelected && "text-muted-foreground hover:text-foreground"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (hasChildren && onToggle) {
            onToggle()
          }
          if (onClick) {
            onClick()
          }
        }}
      >
        {hasChildren && (
          <span className="flex-shrink-0">
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        )}
        {!hasChildren && <span className="w-3.5" />}
        {icon}
        <span className="text-left break-words whitespace-normal leading-tight">{label}</span>
      </button>
      {isOpen && children && <div>{children}</div>}
    </div>
  )
}

export function Sidebar({ data, selectedSet, onSelectSet }: SidebarProps) {
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({})
  const [openClasificaciones, setOpenClasificaciones] = useState<Record<string, boolean>>({})

  const toggleCategoria = (id: number) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleClasificacion = (categoriaId: number, clasificacionId: number) => {
    const key = `${categoriaId}-${clasificacionId}`
    setOpenClasificaciones((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">MAOS Viewer</h1>
            <p className="text-xs text-muted-foreground">Sets & Ofertas</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categorías
        </div>
        {data.map((categoria) => (
          <TreeItem
            key={categoria.id}
            label={categoria.nombre}
            icon={
              openCategories[categoria.id] ? (
                <FolderOpen className="h-4 w-4 text-primary" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              )
            }
            hasChildren={categoria.clasificaciones.length > 0}
            isOpen={openCategories[categoria.id]}
            onToggle={() => toggleCategoria(categoria.id)}
            level={0}
          >
            {categoria.clasificaciones.map((clasificacion) => {
              const clsKey = `${categoria.id}-${clasificacion.id}`
              return (
                <TreeItem
                  key={clasificacion.id}
                  label={clasificacion.nombre}
                  icon={
                    openClasificaciones[clsKey] ? (
                      <FolderOpen className="h-4 w-4 text-chart-2" />
                    ) : (
                      <Folder className="h-4 w-4 text-muted-foreground" />
                    )
                  }
                  hasChildren={clasificacion.sets.length > 0}
                  isOpen={openClasificaciones[clsKey]}
                  onToggle={() => toggleClasificacion(categoria.id, clasificacion.id)}
                  level={1}
                >
                  {clasificacion.sets.map((set) => (
                    <TreeItem
                      key={set.id}
                      label={set.nombre}
                      icon={<Package className="h-4 w-4" />}
                      isSelected={selectedSet?.id === set.id}
                      onClick={() => onSelectSet(set, categoria, clasificacion)}
                      level={2}
                    />
                  ))}
                </TreeItem>
              )
            })}
          </TreeItem>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{data.length}</span> categorías cargadas
        </div>
      </div>
    </aside>
  )
}
