import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <div>
                <h3 className="font-serif font-semibold">Holly Xaviera</h3>
                <p className="text-xs text-neutral-400">Export Company</p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Premium Indonesian commodities exported with excellence. Connecting local farmers to global markets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-neutral-400">
              <li><Link href="/shop" className="hover:text-primary-400 transition-colors">Shop Products</Link></li>
              <li><Link href="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-neutral-400">
              <li><Link href="/shop?category=coffee" className="hover:text-primary-400 transition-colors">Coffee Beans</Link></li>
              <li><Link href="/shop?category=spices" className="hover:text-primary-400 transition-colors">Spices</Link></li>
              <li><Link href="/shop?category=palm-oil" className="hover:text-primary-400 transition-colors">Palm Oil</Link></li>
              <li><Link href="/shop?category=cocoa" className="hover:text-primary-400 transition-colors">Cocoa</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-neutral-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>Kepahiang, Bengkulu<br/>Indonesia</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a href="mailto:info@xavieraexport.com" className="hover:text-primary-400">info@xavieraexport.com</a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a href="https://wa.me/6281234567890" className="hover:text-primary-400">+62 812 3456 7890</a>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-400 text-sm">
          <p>&copy; {new Date().getFullYear()} PT. Holly Xaviera Export. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
