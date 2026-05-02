'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Filter } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  category: string
  origin: string
  specs?: any
}

const categories = ['All', 'Coffee', 'Spices', 'Palm Oil', 'Cocoa', 'Other']

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*')
      if (data) setProducts(data)
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-800 mb-4">Our Products</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">Premium Indonesian commodities sourced directly from local farmers</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-neutral-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-1/4" />
                  <div className="h-6 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden group hover:shadow-xl transition-all">
                <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs text-primary-600 font-medium uppercase tracking-wide">{product.category}</span>
                  <h3 className="font-serif font-semibold text-lg text-neutral-800 mt-2">{product.name}</h3>
                  <p className="text-neutral-600 text-sm mt-2 line-clamp-2">{product.description}</p>
                  {product.origin && (
                    <p className="text-neutral-500 text-xs mt-3">Origin: {product.origin}</p>
                  )}
                  <button
                    onClick={() => addToCart({
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      image_url: product.image_url,
                      category: product.category
                    })}
                    className="mt-4 w-full py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-600 mb-2">No products found</h3>
            <p className="text-neutral-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  )
}
