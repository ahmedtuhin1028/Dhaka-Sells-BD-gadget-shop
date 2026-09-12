'use client';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/useCart';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', city: 'Dhaka', address: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const subTotal = getTotal();
  const deliveryFee = formData.city === 'Dhaka' ? 60 : 120;
  const grandTotal = subTotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('কার্ট খালি (Cart is empty)');
    
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerInfo: formData, paymentMethod })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      if (paymentMethod === 'COD') {
        clearCart();
        toast.success('অর্ডার সফল হয়েছে! (Order Placed!)');
        router.push(`/order-success/${data.orderId}`);
      } else {
        // Redirect to gateway URL for SSL/bKash
        window.location.href = data.paymentUrl; 
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-6">চেকআউট (Checkout)</h2>
        <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="আপনার নাম (Full Name)" className="border p-3 rounded-lg w-full" 
              onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required type="tel" placeholder="মোবাইল নাম্বার (Phone Number)" className="border p-3 rounded-lg w-full"
              onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <select className="border p-3 rounded-lg w-full" onChange={e => setFormData({...formData, city: e.target.value})}>
            <option value="Dhaka">ঢাকা সিটির ভিতরে (Inside Dhaka)</option>
            <option value="Outside">ঢাকা সিটির বাহিরে (Outside Dhaka)</option>
          </select>
          <textarea required placeholder="সম্পূর্ণ ঠিকানা (Full Address)" className="border p-3 rounded-lg w-full h-24"
            onChange={e => setFormData({...formData, address: e.target.value})} />
          
          <h3 className="text-lg font-bold mt-6 mb-3">পেমেন্ট মেথড (Payment Method)</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 border p-4 rounded-lg cursor-pointer">
              <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
              ক্যাশ অন ডেলিভারি (COD)
            </label>
            <label className="flex items-center gap-2 border p-4 rounded-lg cursor-pointer bg-pink-50">
              <input type="radio" name="payment" value="BKASH" checked={paymentMethod === 'BKASH'} onChange={() => setPaymentMethod('BKASH')} />
              bKash
            </label>
          </div>
        </form>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl h-fit border border-gray-200">
        <h3 className="text-xl font-bold mb-4">অর্ডার সামারি (Summary)</h3>
        <div className="space-y-3 mb-4 text-gray-600 text-sm border-b pb-4">
          <div className="flex justify-between"><span>সাবটোটাল (Subtotal)</span> <span>৳ {subTotal}</span></div>
          <div className="flex justify-between"><span>ডেলিভারি চার্জ (Delivery)</span> <span>৳ {deliveryFee}</span></div>
        </div>
        <div className="flex justify-between font-bold text-xl mb-6">
          <span>সর্বমোট (Total)</span> <span className="text-blue-600">৳ {grandTotal}</span>
        </div>
        <button form="checkout-form" type="submit" disabled={loading} 
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-blue-400">
          {loading ? 'প্রসেসিং...' : 'অর্ডার কনফার্ম করুন (Place Order)'}
        </button>
      </div>
    </div>
  );
}
