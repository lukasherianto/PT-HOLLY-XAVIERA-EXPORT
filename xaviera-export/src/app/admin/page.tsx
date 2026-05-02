'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Package, FileText, Settings, LogOut, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('products')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  
  const [productData, setProductData] = useState({
    name: '',
    category: '',
    description: '',
    origin: '',
    image_url: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchData()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchData()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchData() {
    const [productsRes, ordersRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false })
    ])
    if (productsRes.data) setProducts(productsRes.data)
    if (ordersRes.data) setOrders(ordersRes.data)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAddProduct = async () => {
    setLoading(true)
    const { error } = await supabase.from('products').insert(productData)
    if (error) alert(error.message)
    else {
      setShowProductForm(false)
      setProductData({ name: '', category: '', description: '', origin: '', image_url: '' })
      fetchData()
    }
    setLoading(false)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchData()
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm">
          <h1 className="text-2xl font-serif font-bold text-neutral-800 mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="admin@xavieraexport.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-serif font-bold text-neutral-800">Admin Dashboard</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 text-neutral-600 hover:text-red-600">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'products' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-neutral-600'}`}
          >
            <Package className="w-5 h-5" />
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'orders' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-neutral-600'}`}
          >
            <FileText className="w-5 h-5" />
            Orders ({orders.length})
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-neutral-800">Products</h2>
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            {showProductForm && (
              <div className="bg-white rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Add New Product</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Product Name"
                    value={productData.name}
                    onChange={(e) => setProductData({...productData, name: e.target.value})}
                    className="px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    placeholder="Category"
                    value={productData.category}
                    onChange={(e) => setProductData({...productData, category: e.target.value})}
                    className="px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <textarea
                    placeholder="Description"
                    rows={2}
                    value={productData.description}
                    onChange={(e) => setProductData({...productData, description: e.target.value})}
                    className="md:col-span-2 px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <input
                    placeholder="Origin"
                    value={productData.origin}
                    onChange={(e) => setProductData({...productData, origin: e.target.value})}
                    className="px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    placeholder="Image URL"
                    value={productData.image_url}
                    onChange={(e) => setProductData({...productData, image_url: e.target.value})}
                    className="px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button onClick={handleAddProduct} disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    {loading ? 'Saving...' : 'Save Product'}
                  </button>
                  <button onClick={() => setShowProductForm(false)} className="px-6 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-4">
                  <div className="aspect-square bg-neutral-100 rounded-xl mb-4 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-neutral-800">{product.name}</h3>
                  <p className="text-sm text-neutral-500">{product.category}</p>
                  <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{product.description}</p>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="mt-4 text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-neutral-800 mb-6">Orders</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-neutral-800">{order.customer_name}</h3>
                      <p className="text-sm text-neutral-500">{order.email} | {order.whatsapp}</p>
                    </div>
                    <span className="text-xs text-neutral-400">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-neutral-600"><strong>Country:</strong> {order.country}</p>
                    <p className="text-sm text-neutral-600"><strong>Address:</strong> {order.address}</p>
                    {order.notes && <p className="text-sm text-neutral-600 mt-2"><strong>Notes:</strong> {order.notes}</p>}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-neutral-700 mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.cart_items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
