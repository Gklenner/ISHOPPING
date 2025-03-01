export type Product = {
  id: string
  name: string
  price: number
  image: string
  rating: number
  isNew?: boolean
  discount?: number
  category?: string
}

export type Category = {
  id: string
  name: string
  icon: string
}

