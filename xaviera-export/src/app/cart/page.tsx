'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Trash2, ArrowRight, Plus, Minus } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalItems } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingCart className="w-24 h-24 text-neutral-300 mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold text-neutral-800 mb-4">Your Cart is Empty</h1>
          <p className="text-neutral-600 mb-8">Looks like you haven't added any products yet.</p>
          <Link 
            href="/shop" 
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all"
          >
            Browse Products
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-neutral-800 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 flex gap-6">
                <div className="w-24 h-24 bg-neutral-100 rounded-xl flex-shrink-0 overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">No Image</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-serif font-semibold text-lg text-neutral-800">{item.name}</h3>
                  <p className="text-neutral-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-neutral-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-neutral-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-neutral-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="font-serif font-semibold text-xl text-neutral-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-neutral-600">
                  <span>Total Items</span>
                  <span className="font-medium">{getTotalItems()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Products</span>
                  <span className="font-medium">{items.length}</span>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4 mb-6">
                <p className="text-neutral-600 text-sm leading-relaxed">
                  After submitting your order, our team will contact you with the total price including shipping costs.
                </p>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/shop"
                className="w-full py-4 mt-3 text-neutral-600 rounded-xl font-medium hover:bg-neutral-100 transition-all text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
