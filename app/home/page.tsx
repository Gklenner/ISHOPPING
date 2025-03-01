import Link from "next/link"
import { Search, ShoppingBag, Heart, User, Home, MessageCircle, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CategoryList } from "@/components/category-list"
import { ProductGrid } from "@/components/product-grid"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Shoppe</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/search">
            <Search className="h-6 w-6" />
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingBag className="h-6 w-6" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white text-xs">
              3
            </Badge>
          </Link>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search products" className="pl-10 bg-secondary border-none rounded-lg py-6" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4">
        {/* Categories */}
        <CategoryList />

        {/* Featured Products */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Featured Products</h2>
            <Link href="/products" className="text-primary text-sm">
              See All
            </Link>
          </div>
          <ProductGrid featured={true} />
        </div>

        {/* New Arrivals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">New Arrivals</h2>
            <Link href="/products/new" className="text-primary text-sm">
              See All
            </Link>
          </div>
          <ProductGrid />
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3 max-w-[390px] mx-auto">
        <Link href="/home" className="flex flex-col items-center text-primary">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/wishlist" className="flex flex-col items-center text-muted-foreground">
          <Heart className="h-6 w-6" />
          <span className="text-xs mt-1">Wishlist</span>
        </Link>
        <Link href="/messages" className="flex flex-col items-center text-muted-foreground">
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center text-muted-foreground">
          <Bell className="h-6 w-6" />
          <span className="text-xs mt-1">Notifications</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-muted-foreground">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  )
}

