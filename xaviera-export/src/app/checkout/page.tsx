'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    country: '',
    notes: ''
  })

  if (items.length === 0 && !submitted) {
    router.push('/cart')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('orders').insert({
        customer_name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        address: formData.address,
        country: formData.country,
        notes: formData.notes,
        cart_items: items
      })

      if (error) throw error

      setSubmitted(true)
      clearCart()
    } catch (err) {
      console.error('Error submitting order:', err)
      alert('Failed to submit order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-sm">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold text-neutral-800 mb-4">Order Submitted!</h1>
            <p className="text-neutral-600 mb-8 leading-relaxed">
              Thank you for your order. Our admin team will review your request and contact you via WhatsApp or email 
              with the total price including shipping costs.
            </p>
            <div className="bg-primary-50 rounded-xl p-6 mb-8">
              <p className="text-primary-800 font-medium">
                Expected response time: 24-48 hours
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/cart" className="inline-flex items-center text-neutral-600 hover:text-primary-600 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Cart
        </Link>

        <h1 className="text-4xl font-serif font-bold text-neutral-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-2xl p-8">
            <h2 className="font-serif font-semibold text-xl text-neutral-800 mb-6">Shipping Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="+62 812 3456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Country *</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="United States"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Shipping Address *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Street address, city, state, postal code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Additional Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Any special requirements or questions..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Order'
                )}
              </button>

              <p className="text-xs text-neutral-500 text-center">
                By submitting, you agree that our team will contact you with pricing and shipping details.
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-8 sticky top-24">
              <h2 className="font-serif font-semibold text-xl text-neutral-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0">
                    <div className="w-16 h-16 bg-neutral-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">No Image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800">{item.name}</h4>
                      <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 rounded-xl p-4 mb-6">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> Prices will be confirmed by our team after reviewing your order. 
                  Shipping costs will be calculated based on your location.
                </p>
              </div>

              <div className="text-center text-neutral-600 text-sm">
                <p>Total Items: <span className="font-medium">{items.reduce((sum, i) => sum + i.quantity, 0)}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
