'use client';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/useCart';
import { ShoppingBag, Search, Menu, User } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
            Dhaka Sells <span className="text-orange-500">BD</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 font-medium text-gray-700">
          <Link href="/" className="hover:text-blue-600 transition">হোম (Home)</Link>
          <Link href="/shop" className="hover:text-blue-600 transition">শপ (Shop)</Link>
          <Link href="/categories" className="hover:text-blue-600 transition">ক্যাটাগরি</Link>
          <Link href="/offers" className="text-orange-500 hover:text-orange-600 transition">অফার সমূহ</Link>
        </nav>

        {/* Actions (Search, Account, Cart) */}
        <div className="flex items-center gap-5">
          <button aria-label="Search" className="text-gray-700 hover:text-blue-600">
            <Search className="w-5 h-5" />
          </button>
          <Link href="/account" aria-label="Account" className="hidden sm:block text-gray-700 hover:text-blue-600">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="relative flex items-center text-gray-700 hover:text-blue-600">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
