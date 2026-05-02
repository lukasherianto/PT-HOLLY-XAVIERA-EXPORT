'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-neutral-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-serif font-semibold text-neutral-800">Holly Xaviera</h1>
              <p className="text-xs text-neutral-500">Export Company</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-neutral-600 hover:text-primary-600 transition-colors">Home</Link>
            <Link href="/shop" className="text-neutral-600 hover:text-primary-600 transition-colors">Shop</Link>
            <Link href="/about" className="text-neutral-600 hover:text-primary-600 transition-colors">About</Link>
            <Link href="/blog" className="text-neutral-600 hover:text-primary-600 transition-colors">Blog</Link>
            <Link href="/contact" className="text-neutral-600 hover:text-primary-600 transition-colors">Contact</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 text-neutral-600 hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <button 
              className="md:hidden p-2 text-neutral-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-100">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-neutral-600 hover:text-primary-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/shop" className="text-neutral-600 hover:text-primary-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
              <Link href="/about" className="text-neutral-600 hover:text-primary-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link href="/blog" className="text-neutral-600 hover:text-primary-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              <Link href="/contact" className="text-neutral-600 hover:text-primary-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
