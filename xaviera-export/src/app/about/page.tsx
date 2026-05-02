'use client'
import { Award, Users, Globe, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">About PT. Holly Xaviera Export</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">Connecting Indonesian farmers to global markets with quality and integrity</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-neutral-800 mb-6">Our Story</h2>
              <p className="text-neutral-600 mb-4 leading-relaxed">
                PT. Holly Xaviera Export was founded in Kepahiang, Bengkulu, with a mission to showcase the rich 
                agricultural heritage of Indonesia to the world. Our region is known for its fertile volcanic soil 
                and ideal climate for growing premium coffee, spices, and other commodities.
              </p>
              <p className="text-neutral-600 mb-4 leading-relaxed">
                We work directly with local farmers, ensuring they receive fair prices while maintaining the highest 
                quality standards for export. Our team handles everything from sourcing to documentation, making the 
                export process seamless for our international buyers.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Today, we export to multiple countries across Asia, Europe, and the Americas, building lasting 
                partnerships based on trust, quality, and reliability.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl" />
              <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl" />
              <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl" />
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: 'Quality First', desc: 'Rigorous quality control for every shipment' },
              { icon: Users, title: 'Fair Trade', desc: 'Supporting local farmer communities' },
              { icon: Globe, title: 'Global Reach', desc: 'Exporting to 15+ countries worldwide' },
              { icon: Heart, title: 'Sustainable', desc: 'Environmentally responsible practices' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-serif font-semibold text-lg text-neutral-800 mb-2">{item.title}</h3>
                <p className="text-neutral-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
