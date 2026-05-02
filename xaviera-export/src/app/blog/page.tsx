'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, ArrowRight } from 'lucide-react'

interface Article {
  id: string
  title: string
  content: string
  image?: string
  created_at: string
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setArticles(data)
      setLoading(false)
    }
    fetchArticles()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-800 mb-4">Blog & Insights</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">News about Indonesian commodities, export industry, and market trends</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-neutral-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  <div className="h-6 bg-neutral-200 rounded w-full" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article key={article.id} className="bg-white rounded-2xl overflow-hidden group hover:shadow-xl transition-all">
                <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                  {article.image ? (
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-neutral-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className="font-serif font-semibold text-xl text-neutral-800 mb-3 line-clamp-2">{article.title}</h2>
                  <p className="text-neutral-600 text-sm line-clamp-3 mb-4">{article.content}</p>
                  <button className="text-primary-600 font-medium text-sm flex items-center hover:text-primary-700">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl">
            <h3 className="text-xl font-semibold text-neutral-600 mb-2">No articles yet</h3>
            <p className="text-neutral-500">Check back soon for updates</p>
          </div>
        )}
      </div>
    </div>
  )
}
