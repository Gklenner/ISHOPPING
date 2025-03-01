'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { ProductGrid } from '@/components/product-grid'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchFilters {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  page: number
}

export function ProductSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 1000,
    sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'newest',
    page: Number(searchParams.get('page')) || 1
  })
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)

  const debouncedSearch = useDebounce(filters, 500)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(debouncedSearch).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/products/search?${params}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setProducts(data.products)
      setPagination(data.pagination)

      // Update URL with search params
      router.push(`/products?${params}`, { scroll: false })
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, router])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const categories = [
    'All',
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Toys'
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search products..."
            value={filters.query || ''}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="w-full"
          />
          
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange('category', value)}
            options={categories.map(cat => ({ value: cat.toLowerCase(), label: cat }))}
            placeholder="Select category"
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range</label>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[filters.minPrice || 0, filters.maxPrice || 1000]}
              onValueChange={([min, max]) => {
                handleFilterChange('minPrice', min)
                handleFilterChange('maxPrice', max)
              }}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>${filters.minPrice}</span>
              <span>${filters.maxPrice}</span>
            </div>
          </div>
          
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
            options={sortOptions}
            placeholder="Sort by"
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        <>
          <ProductGrid products={products} />
          
          {pagination && pagination.total > 0 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => handleFilterChange('page', pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="py-2 px-4 text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => handleFilterChange('page', pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}