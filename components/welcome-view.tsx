"use client"

import { Layers, Package, ChevronRight, Users, DollarSign } from "lucide-react"
import type { Categoria } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WelcomeViewProps {
  data: Categoria[]
}

export function WelcomeView({ data }: WelcomeViewProps) {
  const totalSets = data.reduce(
    (acc, cat) =>
      acc + cat.clasificaciones.reduce((acc2, cls) => acc2 + cls.sets.length, 0),
    0
  )
  const totalClasificaciones = data.reduce(
    (acc, cat) => acc + cat.clasificaciones.length,
    0
  )
  const totalOfertas = data.reduce(
    (acc, cat) =>
      acc +
      cat.clasificaciones.reduce(
        (acc2, cls) =>
          acc2 + cls.sets.reduce((acc3, set) => acc3 + set.ofertas.length, 0),
        0
      ),
    0
  )

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Bienvenido a MAOS Viewer</h1>
          <p className="mt-2 text-muted-foreground">
            Selecciona un set desde el panel izquierdo para ver sus productos y ofertas por proveedor.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categorías
              </CardTitle>
              <Layers className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{data.length}</div>
              <p className="text-xs text-muted-foreground">
                {totalClasificaciones} clasificaciones
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sets Disponibles
              </CardTitle>
              <Package className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalSets}</div>
              <p className="text-xs text-muted-foreground">sets médicos</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ofertas
              </CardTitle>
              <Users className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalOfertas}</div>
              <p className="text-xs text-muted-foreground">de proveedores</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Resumen por Categoría</h2>
          <div className="space-y-2">
            {data.map((categoria) => {
              const catSets = categoria.clasificaciones.reduce(
                (acc, cls) => acc + cls.sets.length,
                0
              )
              const catOfertas = categoria.clasificaciones.reduce(
                (acc, cls) =>
                  acc + cls.sets.reduce((acc2, set) => acc2 + set.ofertas.length, 0),
                0
              )
              
              return (
                <div
                  key={categoria.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{categoria.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {categoria.clasificaciones.length} clasificaciones
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        <span>{catSets} sets</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{catOfertas} ofertas</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
