'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/useCart';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  image: string;
  stock: number;
}

export default function ProductCard({ id, name, slug, price, salePrice, image, stock }: ProductProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (stock <= 0) return;
    addItem({ id, name, price: salePrice || price, image, quantity: 1, stock });
    toast.success('কার্টে যোগ করা হয়েছে (Added to Cart)');
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative">
      {/* Discount Badge */}
      {salePrice && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
          {Math.round(((price - salePrice) / price) * 100)}% ছাড়
        </span>
      )}
      
      <Link href={`/product/${slug}`} className="relative h-56 w-full overflow-hidden bg-gray-50">
        <Image 
          src={image} 
          alt={name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/product/${slug}`}>
          <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors mb-2 text-sm sm:text-base">
            {name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex flex-col">
            {salePrice ? (
              <>
                <span className="text-lg font-bold text-blue-600">৳ {salePrice.toLocaleString('en-IN')}</span>
                <span className="text-sm text-gray-400 line-through">৳ {price.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-blue-600">৳ {price.toLocaleString('en-IN')}</span>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className={`p-2.5 rounded-full transition-colors ${
              stock > 0 
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
