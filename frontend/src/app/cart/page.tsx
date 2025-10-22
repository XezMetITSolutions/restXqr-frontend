'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaShoppingCart, 
  FaBell, 
  FaArrowLeft, 
  FaPlus, 
  FaMinus, 
  FaTrash,
  FaCreditCard,
  FaHeart,
  FaGift,
  FaUtensils,
  FaUser
} from 'react-icons/fa';
import { useCartStore } from '@/store';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';
import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';
import SetBrandColor from '@/components/SetBrandColor';
import apiService from '@/services/api';
import useRestaurantStore from '@/store/useRestaurantStore';

function CartPageContent() {
  const { currentLanguage, translate } = useLanguage();
  const { items, tableNumber, removeItem, updateQuantity, clearCart, getMaxPreparationTime } = useCartStore();
  const { settings } = useBusinessSettingsStore();
  const { currentRestaurant } = useRestaurantStore();
  const [isClient, setIsClient] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'donation' | 'tip'>('card');
  const [tipAmount, setTipAmount] = useState(0);
  const [donationAmount, setDonationAmount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const primary = settings.branding.primaryColor;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + tipAmount + donationAmount;

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      updateQuantity(itemId, quantity);
    }
  };

  const handleCheckout = () => {
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Resolve restaurantId (fallback to subdomain lookup if not in store)
      let restaurantId = currentRestaurant?.id as string | undefined;
      if (!restaurantId && typeof window !== 'undefined') {
        try {
          const sub = window.location.hostname.split('.')[0];
          const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
          const API = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
          const res = await fetch(`${API}/staff/restaurants`);
          const data = await res.json();
          const found = Array.isArray(data?.data) ? data.data.find((r: any) => r.username === sub) : null;
          restaurantId = found?.id;
        } catch (e) {
          console.error('Restaurant resolve failed:', e);
        }
      }

      if (!restaurantId) {
        alert('Restoran bilgisi alınamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
        return;
      }
      // Backend'e sipariş gönder
      const orderData = {
        restaurantId,
        tableNumber: tableNumber || undefined,
        items: items.map(item => ({
          menuItemId: item.itemId || item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          price: item.price,
          notes: item.notes || ''
        })),
        notes: `Ödeme yöntemi: ${paymentMethod}, Bahşiş: ${tipAmount}₺, Bağış: ${donationAmount}₺`,
        orderType: 'dine_in'
      };

      const response = await apiService.createOrder(orderData);
      
      if (response.success) {
        // En uzun hazırlık süresini hesapla
        const maxPrepTime = getMaxPreparationTime();
        
        // Clear cart after successful order
        clearCart();
        setShowPaymentModal(false);
        setTipAmount(0);
        setDonationAmount(0);
        
        // Sipariş onay mesajı göster
        if (maxPrepTime > 0) {
          alert(`✅ Siparişiniz alınmıştır!\n\nSiparişiniz ${maxPrepTime} dakika içinde masanıza getirilecektir.`);
        } else {
          alert('✅ Siparişiniz alınmıştır!\n\nSiparişiniz kısa sürede masanıza getirilecektir.');
        }
      } else {
        alert('❌ Sipariş gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('❌ Sipariş gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTip = () => {
    setShowTipModal(true);
  };

  const handleDonation = () => {
    setShowDonationModal(true);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <SetBrandColor />
      <main className="min-h-screen pb-20">
        {/* Header */}
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20">
          <div className="container mx-auto px-3 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/menu" className="mr-2">
                <FaArrowLeft size={16} />
              </Link>
              <h1 className="text-dynamic-lg font-bold text-primary">
                <TranslatedText>Sepet</TranslatedText>
              </h1>
              <div className="ml-2 px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: 'var(--tone1-bg)', color: 'var(--tone1-text)', border: '1px solid var(--tone1-border)' }}>
                <TranslatedText>Masa #{tableNumber}</TranslatedText>
              </div>
            </div>
          </div>
        </header>

        {/* Cart Items */}
        <div className="pt-16 px-3 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FaShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                <TranslatedText>Sepetiniz boş</TranslatedText>
              </h3>
              <p className="text-gray-500 mb-6">
                <TranslatedText>Menüden ürün ekleyerek başlayın</TranslatedText>
              </p>
              <Link 
                href="/menu"
                className="btn btn-primary px-6 py-3 rounded-lg"
              >
                <TranslatedText>Menüye Git</TranslatedText>
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.itemId} className="bg-white rounded-lg shadow-sm border p-3 flex">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image 
                        src={item.image || '/placeholder-food.jpg'} 
                        alt={item.name} 
                        width={64} 
                        height={64} 
                        className="object-cover w-full h-full rounded-lg"
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-dynamic-sm">{item.name}</h3>
                        <button 
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        <TranslatedText>₺{item.price}</TranslatedText>
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                        <span className="font-semibold text-dynamic-sm" style={{ color: primary }}>
                          <TranslatedText>₺{(item.price * item.quantity).toFixed(2)}</TranslatedText>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Options */}
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <h3 className="font-semibold text-dynamic-sm mb-4">
                  <TranslatedText>Ödeme Seçenekleri</TranslatedText>
                </h3>
                
                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                      paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <FaCreditCard className={paymentMethod === 'card' ? 'text-blue-500' : 'text-gray-500'} />
                    <span className="text-sm font-medium">
                      <TranslatedText>Kart</TranslatedText>
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                      paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <FaUser className={paymentMethod === 'cash' ? 'text-blue-500' : 'text-gray-500'} />
                    <span className="text-sm font-medium">
                      <TranslatedText>Nakit</TranslatedText>
                    </span>
                  </button>
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <button
                    onClick={handleTip}
                    className="w-full p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <FaHeart className="text-pink-500" />
                      <span className="text-sm font-medium">
                        <TranslatedText>Garsona Bahşiş</TranslatedText>
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      <TranslatedText>₺{tipAmount.toFixed(2)}</TranslatedText>
                    </span>
                  </button>

                  <button
                    onClick={handleDonation}
                    className="w-full p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <FaGift className="text-green-500" />
                      <span className="text-sm font-medium">
                        <TranslatedText>Bağış Yap</TranslatedText>
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      <TranslatedText>₺{donationAmount.toFixed(2)}</TranslatedText>
                    </span>
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <h3 className="font-semibold text-dynamic-sm mb-3">
                  <TranslatedText>Sipariş Özeti</TranslatedText>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span><TranslatedText>Ara Toplam</TranslatedText></span>
                    <span>₺{subtotal.toFixed(2)}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span><TranslatedText>Bahşiş</TranslatedText></span>
                      <span>₺{tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {donationAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span><TranslatedText>Bağış</TranslatedText></span>
                      <span>₺{donationAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold text-dynamic-sm">
                    <span><TranslatedText>Toplam</TranslatedText></span>
                    <span style={{ color: primary }}>₺{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full btn btn-primary py-4 rounded-lg font-semibold text-dynamic-sm"
              >
                {paymentMethod === 'cash' ? (
                  <span>Siparişi Ver</span>
                ) : (
                  <TranslatedText>Ödemeyi Tamamla</TranslatedText>
                )}
              </button>
            </>
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 shadow-lg">
          <div className="container mx-auto flex justify-around">
            <Link href="/menu" className="flex flex-col items-center" style={{ color: primary }}>
              <FaUtensils className="mb-0.5" size={16} />
              <span className="text-[10px]"><TranslatedText>Menü</TranslatedText></span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center" style={{ color: primary }}>
              <div className="relative">
                <FaShoppingCart className="mb-0.5" size={16} />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </div>
              <span className="text-[10px]"><TranslatedText>Sepet</TranslatedText></span>
            </Link>
            <Link href="/waiter" className="flex flex-col items-center" style={{ color: primary }}>
              <FaBell className="mb-0.5" size={16} />
              <span className="text-[10px]"><TranslatedText>Garson Çağır</TranslatedText></span>
            </Link>
          </div>
        </nav>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              <TranslatedText>Ödeme Onayı</TranslatedText>
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <TranslatedText>Toplam Tutar:</TranslatedText>
              </p>
              <p className="text-2xl font-bold" style={{ color: primary }}>
                ₺{total.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <TranslatedText>İptal</TranslatedText>
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 py-2 px-4 btn btn-primary rounded-lg"
              >
                {paymentMethod === 'cash' ? <span>Siparişi Ver</span> : <TranslatedText>Öde</TranslatedText>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              <TranslatedText>Bahşiş Miktarı</TranslatedText>
            </h3>
            
            {/* Yüzde Butonları */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <TranslatedText>Hızlı Seçim</TranslatedText>
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setTipAmount(subtotal * 0.03)}
                  className="py-2 px-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  3% - ₺{(subtotal * 0.03).toFixed(2)}
                </button>
                <button
                  onClick={() => setTipAmount(subtotal * 0.05)}
                  className="py-2 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  5% - ₺{(subtotal * 0.05).toFixed(2)}
                </button>
                <button
                  onClick={() => setTipAmount(subtotal * 0.10)}
                  className="py-2 px-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  10% - ₺{(subtotal * 0.10).toFixed(2)}
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TranslatedText>Manuel Miktar</TranslatedText>
              </label>
              <input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <TranslatedText>İptal</TranslatedText>
              </button>
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 py-2 px-4 btn btn-primary rounded-lg"
              >
                <TranslatedText>Tamam</TranslatedText>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              <TranslatedText>Bağış Miktarı</TranslatedText>
            </h3>
            
            {/* Yüzde Butonları */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <TranslatedText>Hızlı Seçim</TranslatedText>
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setDonationAmount(subtotal * 0.03)}
                  className="py-2 px-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  3% - ₺{(subtotal * 0.03).toFixed(2)}
                </button>
                <button
                  onClick={() => setDonationAmount(subtotal * 0.05)}
                  className="py-2 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  5% - ₺{(subtotal * 0.05).toFixed(2)}
                </button>
                <button
                  onClick={() => setDonationAmount(subtotal * 0.10)}
                  className="py-2 px-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  10% - ₺{(subtotal * 0.10).toFixed(2)}
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TranslatedText>Manuel Miktar</TranslatedText>
              </label>
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDonationModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <TranslatedText>İptal</TranslatedText>
              </button>
              <button
                onClick={() => setShowDonationModal(false)}
                className="flex-1 py-2 px-4 btn btn-primary rounded-lg"
              >
                <TranslatedText>Tamam</TranslatedText>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CartPage() {
  return (
    <LanguageProvider>
      <CartPageContent />
    </LanguageProvider>
  );
}
