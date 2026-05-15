export interface Producto {
  id: number
  codigo: string
  nombre: string
  cantidad: number
  precioUnitario?: number
}

export interface Proveedor {
  codigo: string
  nombre: string
}

export interface Oferta {
  id: number
  proveedor: Proveedor
  productos: Producto[]
}

export interface Set {
  id: number
  nombre: string
  productos: Producto[]
  ofertas: Oferta[]
}

export interface Clasificacion {
  id: number
  nombre: string
  sets: Set[]
}

export interface Categoria {
  id: number
  nombre: string
  clasificaciones: Clasificacion[]
}

export type ApiResponse = Categoria[]
