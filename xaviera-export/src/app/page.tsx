'use client'

import Link from 'next/link'
import { ArrowRight, Coffee, Sprout, Droplet, Award, Truck, Globe } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  category: string
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .limit(4)
      if (data) setFeaturedProducts(data)
    }
    fetchProducts()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 via-primary-50 to-neutral-100" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1524350876685-274059332603?w=1920')] bg-cover bg-center" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-neutral-800 mb-6 leading-tight">
            Premium Indonesian<br />
            <span className="text-primary-600">Commodities Export</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
            Connecting the rich agricultural heritage of Kepahiang, Bengkulu to global markets. 
            Quality coffee, spices, and natural products sourced directly from local farmers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Explore Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-neutral-800 rounded-full font-semibold border-2 border-neutral-200 hover:border-primary-300 transition-all"
            >
              Request Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-800 mb-4">Featured Products</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Discover our premium selection of Indonesian commodities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Link key={product.id} href={`/shop`} className="group">
                  <div className="bg-neutral-50 rounded-2xl overflow-hidden transition-all group-hover:shadow-xl">
                    <div className="aspect-square bg-neutral-200 relative overflow-hidden">
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
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Placeholder products
              <>
                {[
                  { name: 'Arabica Coffee Beans', category: 'Coffee', desc: 'Premium single-origin Arabica from Bengkulu highlands' },
                  { name: 'Robusta Coffee', category: 'Coffee', desc: 'Bold and rich Robusta beans for espresso blends' },
                  { name: 'Black Pepper', category: 'Spices', desc: 'Aromatic black pepper with intense flavor' },
                  { name: 'Cinnamon Sticks', category: 'Spices', desc: 'Authentic Indonesian cinnamon with sweet aroma' }
                ].map((item, idx) => (
                  <Link key={idx} href="/shop" className="group">
                    <div className="bg-neutral-50 rounded-2xl overflow-hidden transition-all group-hover:shadow-xl">
                      <div className="aspect-square bg-neutral-200" />
                      <div className="p-6">
                        <span className="text-xs text-primary-600 font-medium uppercase tracking-wide">{item.category}</span>
                        <h3 className="font-serif font-semibold text-lg text-neutral-800 mt-2">{item.name}</h3>
                        <p className="text-neutral-600 text-sm mt-2">{item.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/shop" className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700">
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-800 mb-4">Why Choose Holly Xaviera</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">We combine local expertise with international standards</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: 'Quality Assured', desc: 'Every product meets international export standards with rigorous quality control.' },
              { icon: Sprout, title: 'Direct Sourcing', desc: 'We work directly with local farmers, ensuring fair prices and sustainable practices.' },
              { icon: Truck, title: 'Reliable Shipping', desc: 'Efficient logistics network to deliver your orders on time, anywhere in the world.' },
              { icon: Globe, title: 'Global Reach', desc: 'Exporting to multiple countries with full documentation and compliance.' },
              { icon: Coffee, title: 'Premium Products', desc: 'Only the finest Indonesian commodities, carefully selected for export.' },
              { icon: Droplet, title: 'Natural & Organic', desc: 'Many of our products are naturally grown without harmful chemicals.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-serif font-semibold text-xl text-neutral-800 mb-3">{item.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-800 mb-6">About PT. Holly Xaviera Export</h2>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Based in the heart of Kepahiang, Bengkulu, we are dedicated to showcasing the rich agricultural 
                bounty of Indonesia to the world. Our company bridges the gap between local farmers and 
                international buyers, ensuring quality products and fair trade practices.
              </p>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                With years of experience in the export industry, we understand the importance of reliability, 
                quality, and building lasting partnerships with our clients worldwide.
              </p>
              <Link href="/about" className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700">
                Learn More About Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl" />
                <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl" />
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl" />
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Ready to Start Your Order?</h2>
          <p className="text-primary-100 mb-8 text-lg">
            Browse our products and submit your order. Our team will contact you with pricing and shipping details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-primary-50 transition-all"
            >
              Shop Now
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white rounded-full font-semibold border-2 border-white/50 hover:border-white transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
