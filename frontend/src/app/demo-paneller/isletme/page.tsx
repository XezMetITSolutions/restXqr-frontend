'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BusinessSidebar from '@/components/BusinessSidebar';
import { 
  FaStore, 
  FaUtensils, 
  FaUsers, 
  FaShoppingCart,
  FaChartLine,
  FaChartBar,
  FaQrcode,
  FaHeadset,
  FaCog,
  FaSignOutAlt,
  FaClipboardList,
  FaTimes,
  FaBullhorn,
  FaBars,
  FaMoneyBillWave,
  FaPlus,
  FaEye,
  FaEdit,
  FaRocket
} from 'react-icons/fa';
import useRestaurantStore from '@/store/useRestaurantStore';
import { useState } from 'react';

export default function BusinessDashboard() {
  const router = useRouter();
  const { 
    categories, 
    menuItems, 
    orders, 
    activeOrders, 
    fetchRestaurantMenu,
    loading: restaurantLoading 
  } = useRestaurantStore();
  
  // Demo restoran bilgileri
  useEffect(() => {
    // Demo veri ekle
    console.log('Demo İşletme Paneli açıldı');
  }, []);
  
  const displayName = 'RestXQr Restoranı';
  const displayEmail = 'demo@restxqr.com';
  
  // Premium plan state'leri
  const [currentPlan, setCurrentPlan] = useState('premium');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<{[key: string]: number}>({});
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'sixMonths' | 'yearly'>('monthly');
  const [corporateBillingCycle, setCorporateBillingCycle] = useState<'monthly' | 'sixMonths' | 'yearly'>('monthly');
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'corporate'>('premium');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Restoranlar sayfasından alınan planlar ve fiyatlar
  const plans = {
    premium: {
      name: 'Premium Paket',
      description: 'Küçük ve orta ölçekli işletmeler için',
      features: [
        'QR Menü Sistemi (Sınırsız menü, anlık güncelleme)',
        'Mutfak Paneli (5 kullanıcı, sipariş takibi)',
        'Garson Paneli (3 kullanıcı, masa yönetimi)',
        'İşletme Paneli (2 kullanıcı, raporlama)',
        'Müşteri Uygulaması (Sipariş verme, ödeme)',
        '7/24 WhatsApp Destek',
        'Google Yorum Entegrasyonu',
        'Detaylı Satış Raporları',
        'Mobil Uyumlu Tasarım',
        'Stok Yönetimi'
      ],
      pricing: {
        monthly: 4980,
        sixMonths: 24900,
        yearly: 47900
      }
    },
    corporate: {
      name: 'Kurumsal Paket',
      description: 'Büyük restoran zincirleri için',
      features: [
        'Premium paketin tüm özellikleri',
        'Tüm panellerde sınırsız kullanıcı',
        'POS Entegrasyonu (NFC ödeme, kredi kartı)',
        'AI Menü Önerileri',
        'Video Menü',
        'Personel Yönetimi (İK, işe alım)',
        'Zincir yönetimi (Çoklu şube)',
        'Tedarikçi Yönetimi',
        'Özel entegrasyonlar',
        'Dedicated account manager'
      ],
      pricing: {
        monthly: 12980,
        sixMonths: 63900,
        yearly: 119800
      }
    }
  };

  const [demoOrders] = useState([
    { id: '1', status: 'pending', total: 245.50, items: 3, table: 5, time: '14:32' },
    { id: '2', status: 'preparing', total: 189.00, items: 2, table: 8, time: '14:28' },
    { id: '3', status: 'ready', total: 320.00, items: 4, table: 3, time: '14:15' },
    { id: '4', status: 'pending', total: 156.75, items: 1, table: 12, time: '14:05' },
    { id: '5', status: 'preparing', total: 289.50, items: 3, table: 7, time: '13:58' }
  ]);

  const stats = {
    todayRevenue: 15240.50,
    todayOrders: 47,
    todayCustomers: 89,
    activeOrders: activeOrders || demoOrders.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <BusinessSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        displayName={displayName}
        displayEmail={displayEmail}
        onLogout={() => {}}
      />

      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} min-h-screen`}>
        {/* Modern Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-xl border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 lg:px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-4 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-110"
              >
                <FaBars className="text-xl text-gray-600" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <FaStore className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                    İşletme Paneli
                  </h2>
                  <p className="text-gray-600 text-lg font-semibold mt-1">RestXQr Demo Restoranı</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                <div className="text-xs font-bold opacity-90">BUGÜNKÜ KAZANÇ</div>
                <div className="text-2xl font-black">₺{stats.todayRevenue.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Bugünkü Satış */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-6 shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FaMoneyBillWave className="text-3xl" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black">₺{stats.todayRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                  <div className="text-sm opacity-90 font-semibold">Bugünkü Satış</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaChartLine className="text-green-300" />
                <span className="font-bold">+12.5%</span>
                <span className="opacity-80">dün ile karşılaştırma</span>
              </div>
            </div>

            {/* Bugünkü Sipariş */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FaShoppingCart className="text-3xl" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black">{stats.todayOrders}</div>
                  <div className="text-sm opacity-90 font-semibold">Bugünkü Sipariş</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaChartBar className="text-green-300" />
                <span className="font-bold">+8</span>
                <span className="opacity-80">dün ile karşılaştırma</span>
              </div>
            </div>

            {/* Müşteri Sayısı */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FaUsers className="text-3xl" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black">{stats.todayCustomers}</div>
                  <div className="text-sm opacity-90 font-semibold">Bugünkü Müşteri</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaChartLine className="text-green-300" />
                <span className="font-bold">+15.3%</span>
                <span className="opacity-80">dün ile karşılaştırma</span>
              </div>
            </div>

            {/* Aktif Sipariş */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FaClipboardList className="text-3xl" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black">{stats.activeOrders}</div>
                  <div className="text-sm opacity-90 font-semibold">Aktif Sipariş</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaRocket className="text-yellow-300 animate-pulse" />
                <span className="font-bold">Canlı Takip</span>
                <span className="opacity-80">gerçek zamanlı</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">📋 Son Siparişler</h3>
              <Link href="/demo-paneller/isletme/orders" className="text-blue-600 hover:text-blue-700 font-bold">
                Tümünü Gör →
              </Link>
            </div>
            <div className="space-y-3">
              {demoOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white ${
                      order.status === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                      order.status === 'preparing' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                      order.status === 'ready' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                      'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}>
                      {order.id}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">Masa {order.table}</div>
                      <div className="text-sm text-gray-600">{order.items} ürün • ₺{order.total.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{order.time}</span>
                    <span className={`px-4 py-2 rounded-xl font-bold text-sm ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ready' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? 'Beklemede' : 
                       order.status === 'preparing' ? 'Hazırlanıyor' :
                       order.status === 'ready' ? 'Hazır' : 'Tamamlandı'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/demo-paneller/isletme/menu" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FaUtensils className="text-3xl" />
                </div>
                <div className="text-2xl font-black">Menü Yönetimi</div>
              </div>
              <p className="opacity-90 text-lg">Menünüzü düzenleyin ve yeni ürünler ekleyin</p>
            </Link>

            <Link href="/demo-paneller/isletme/reports" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FaChartBar className="text-3xl" />
                </div>
                <div className="text-2xl font-black">Raporlar</div>
              </div>
              <p className="opacity-90 text-lg">Detaylı satış ve performans raporlarını görüntüleyin</p>
            </Link>

            <Link href="/demo-paneller/isletme/settings" className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <FaCog className="text-3xl" />
                </div>
                <div className="text-2xl font-black">Ayarlar</div>
              </div>
              <p className="opacity-90 text-lg">Restoran ayarlarınızı yönetin</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
