"use client"

import { Package, DollarSign, Users, TrendingDown, Download } from "lucide-react"
import * as XLSX from "xlsx"
import type { Set, Categoria, Clasificacion } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface SetDetailProps {
  set: Set
  categoria: Categoria
  clasificacion: Clasificacion
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function getOfertaTotal(oferta: { productos: { cantidad: number; precioUnitario?: number }[] }): number {
  return oferta.productos.reduce((acc, p) => acc + p.cantidad * (p.precioUnitario || 0), 0)
}

function exportToExcel(set: Set, categoria: Categoria, clasificacion: Clasificacion) {
  const wb = XLSX.utils.book_new()

  // Hoja 1: Resumen del Set
  const resumenData = [
    ["RESUMEN DEL SET"],
    ["Categoría", categoria.nombre],
    ["Clasificación", clasificacion.nombre],
    ["Set", set.nombre],
    [""],
    ["Productos Requeridos", set.productos.length],
    ["Proveedores", set.ofertas.length],
  ]
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen")

  // Hoja 2: Productos del Set
  const productosData = [
    ["PRODUCTOS DEL SET"],
    ["Código", "Nombre", "Cantidad"],
    ...set.productos.map((p) => [p.codigo, p.nombre, p.cantidad]),
  ]
  const wsProductos = XLSX.utils.aoa_to_sheet(productosData)
  XLSX.utils.book_append_sheet(wb, wsProductos, "Productos")

  // Hoja 3: Ofertas por Proveedor
  const ofertasData: (string | number)[][] = [["OFERTAS POR PROVEEDOR"], [""]]
  
  const sortedOfertas = [...set.ofertas].sort(
    (a, b) => getOfertaTotal(a) - getOfertaTotal(b)
  )

  sortedOfertas.forEach((oferta, index) => {
    ofertasData.push([`${index + 1}. ${oferta.proveedor.nombre} (${oferta.proveedor.codigo})`])
    ofertasData.push(["Código", "Producto", "Cantidad", "Precio Unitario", "Subtotal"])
    oferta.productos.forEach((p) => {
      ofertasData.push([
        p.codigo,
        p.nombre,
        p.cantidad,
        p.precioUnitario || 0,
        p.cantidad * (p.precioUnitario || 0),
      ])
    })
    ofertasData.push(["", "", "", "TOTAL:", getOfertaTotal(oferta)])
    ofertasData.push([""])
  })
  const wsOfertas = XLSX.utils.aoa_to_sheet(ofertasData)
  XLSX.utils.book_append_sheet(wb, wsOfertas, "Ofertas por Proveedor")

  // Hoja 4: Comparación de Precios
  const comparacionHeaders = ["Código", "Producto", ...set.ofertas.map((o) => o.proveedor.nombre)]
  const comparacionData: (string | number)[][] = [
    ["COMPARACIÓN DE PRECIOS"],
    comparacionHeaders,
  ]

  set.productos.forEach((producto) => {
    const row: (string | number)[] = [producto.codigo, producto.nombre]
    set.ofertas.forEach((oferta) => {
      const ofertaProducto = oferta.productos.find((p) => p.codigo === producto.codigo)
      row.push(ofertaProducto?.precioUnitario || 0)
    })
    comparacionData.push(row)
  })

  // Fila de totales
  const totalesRow: (string | number)[] = ["", "TOTAL"]
  set.ofertas.forEach((oferta) => {
    totalesRow.push(getOfertaTotal(oferta))
  })
  comparacionData.push(totalesRow)

  const wsComparacion = XLSX.utils.aoa_to_sheet(comparacionData)
  XLSX.utils.book_append_sheet(wb, wsComparacion, "Comparación de Precios")

  // Descargar archivo
  const fileName = `${set.nombre.replace(/[^a-zA-Z0-9]/g, "_")}_ofertas.xlsx`
  XLSX.writeFile(wb, fileName)
}

export function SetDetail({ set, categoria, clasificacion }: SetDetailProps) {
  const sortedOfertas = [...set.ofertas].sort(
    (a, b) => getOfertaTotal(a) - getOfertaTotal(b)
  )
  
  const bestOffer = sortedOfertas[0]
  const worstOffer = sortedOfertas[sortedOfertas.length - 1]
  const savings = bestOffer && worstOffer ? getOfertaTotal(worstOffer) - getOfertaTotal(bestOffer) : 0

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{categoria.nombre}</span>
            <span>/</span>
            <span>{clasificacion.nombre}</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{set.nombre}</h2>
        </div>
        <Button
          onClick={() => exportToExcel(set, categoria, clasificacion)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Productos Requeridos
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{set.productos.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Proveedores
            </CardTitle>
            <Users className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{set.ofertas.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mejor Oferta
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {bestOffer ? formatCurrency(getOfertaTotal(bestOffer)) : "N/A"}
            </div>
            {bestOffer && (
              <p className="text-xs text-muted-foreground">{bestOffer.proveedor.nombre}</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ahorro Potencial
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(savings)}
            </div>
            <p className="text-xs text-muted-foreground">vs. oferta más cara</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ofertas" className="w-full">
        <TabsList className="bg-secondary">
          <TabsTrigger value="ofertas">Ofertas por Proveedor</TabsTrigger>
          <TabsTrigger value="productos">Productos del Set</TabsTrigger>
          <TabsTrigger value="comparacion">Comparación de Precios</TabsTrigger>
        </TabsList>

        <TabsContent value="ofertas" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {sortedOfertas.map((oferta, index) => (
              <Card key={oferta.id} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                        {oferta.proveedor.nombre.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">
                          {oferta.proveedor.nombre}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Código: {oferta.proveedor.codigo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {index === 0 && (
                        <Badge className="bg-success/20 text-success border-success/30 mb-1">
                          Mejor precio
                        </Badge>
                      )}
                      <div className="text-lg font-bold text-foreground">
                        {formatCurrency(getOfertaTotal(oferta))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Producto</TableHead>
                        <TableHead className="text-right text-muted-foreground">Cant.</TableHead>
                        <TableHead className="text-right text-muted-foreground">P. Unit.</TableHead>
                        <TableHead className="text-right text-muted-foreground">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {oferta.productos.map((producto) => (
                        <TableRow key={producto.id} className="border-border">
                          <TableCell className="text-foreground">
                            <div>
                              <div className="font-medium">{producto.nombre}</div>
                              <div className="text-xs text-muted-foreground">{producto.codigo}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-foreground">
                            {producto.cantidad}
                          </TableCell>
                          <TableCell className="text-right text-foreground">
                            {formatCurrency(producto.precioUnitario || 0)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            {formatCurrency(producto.cantidad * (producto.precioUnitario || 0))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="productos" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Productos Requeridos en el Set</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Código</TableHead>
                    <TableHead className="text-muted-foreground">Nombre</TableHead>
                    <TableHead className="text-right text-muted-foreground">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {set.productos.map((producto) => (
                    <TableRow key={producto.id} className="border-border">
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {producto.codigo}
                      </TableCell>
                      <TableCell className="text-foreground">{producto.nombre}</TableCell>
                      <TableCell className="text-right text-foreground">
                        <Badge variant="secondary">{producto.cantidad}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparacion" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Comparación de Precios por Producto</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground min-w-[200px]">Producto</TableHead>
                    {set.ofertas.map((oferta) => (
                      <TableHead
                        key={oferta.id}
                        className="text-center text-muted-foreground min-w-[120px]"
                      >
                        {oferta.proveedor.nombre}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {set.productos.map((producto) => {
                    const precios = set.ofertas.map((oferta) => {
                      const ofertaProducto = oferta.productos.find(
                        (p) => p.codigo === producto.codigo
                      )
                      return ofertaProducto?.precioUnitario || 0
                    })
                    const minPrecio = Math.min(...precios.filter((p) => p > 0))

                    return (
                      <TableRow key={producto.id} className="border-border">
                        <TableCell className="text-foreground">
                          <div>
                            <div className="font-medium">{producto.nombre}</div>
                            <div className="text-xs text-muted-foreground">{producto.codigo}</div>
                          </div>
                        </TableCell>
                        {set.ofertas.map((oferta) => {
                          const ofertaProducto = oferta.productos.find(
                            (p) => p.codigo === producto.codigo
                          )
                          const precio = ofertaProducto?.precioUnitario || 0
                          const isMin = precio === minPrecio && precio > 0

                          return (
                            <TableCell
                              key={oferta.id}
                              className={`text-center ${isMin ? "text-success font-bold" : "text-foreground"}`}
                            >
                              {precio > 0 ? formatCurrency(precio) : "-"}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                  <TableRow className="border-border bg-secondary/50">
                    <TableCell className="font-bold text-foreground">TOTAL</TableCell>
                    {sortedOfertas.length > 0
                      ? set.ofertas.map((oferta) => {
                          const total = getOfertaTotal(oferta)
                          const minTotal = getOfertaTotal(sortedOfertas[0])
                          const isMin = total === minTotal

                          return (
                            <TableCell
                              key={oferta.id}
                              className={`text-center font-bold ${isMin ? "text-success" : "text-foreground"}`}
                            >
                              {formatCurrency(total)}
                            </TableCell>
                          )
                        })
                      : null}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
