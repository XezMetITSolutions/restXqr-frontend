'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnnouncementQuickModal from '@/components/AnnouncementQuickModal';
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
  FaEdit
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import { useState } from 'react';
import BusinessPaymentModal from '@/components/BusinessPaymentModal';
import { useFeature } from '@/hooks/useFeature';

export default function BusinessDashboard() {
  const router = useRouter();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout, initializeAuth } = useAuthStore();
  const { 
    categories, 
    menuItems, 
    orders, 
    activeOrders, 
    fetchRestaurantMenu,
    loading: restaurantLoading 
  } = useRestaurantStore();
  
  // Sayfa yüklendiginde auth'u initialize et
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  // Restaurant menüsünü yükle
  useEffect(() => {
    if (authenticatedRestaurant?.id) {
      fetchRestaurantMenu(authenticatedRestaurant.id);
    }
  }, [authenticatedRestaurant?.id, fetchRestaurantMenu]);
  
  // Giriş yapan kişinin adını al
  const displayName = authenticatedRestaurant?.name || authenticatedStaff?.name || 'Kullanıcı';
  const displayEmail = authenticatedRestaurant?.email || authenticatedStaff?.email || '';
  
  // Premium plan state'leri
  const [currentPlan, setCurrentPlan] = useState('premium'); // basic, premium, enterprise
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
      description: 'Büyük işletmeler ve zincirler için',
      features: [
        'Premium Paket\'in Tüm Özellikleri',
        'Sınırsız Kullanıcı (Tüm paneller)',
        'Çoklu Şube Yönetimi',
        'Özel Menü ve Logo Entegrasyonu',
        'Özel Tema Tasarımı',
        'API Entegrasyonları (POS, Muhasebe)',
        'Özel Eğitim ve Danışmanlık',
        'Öncelikli WhatsApp Destek',
        'Gelişmiş Analitik ve Raporlama',
        'Özel Geliştirmeler',
        'Dedicated Account Manager',
        '7/24 Telefon Desteği',
        'Özel Rapor Şablonları',
        'Beyaz Etiket Çözümü'
      ],
      pricing: {
        monthly: 9980,
        sixMonths: 49900,
        yearly: 95900
      }
    }
  };

  // Ek hizmetler ve fiyatlandırma (Türkiye şartlarına göre)
  const additionalServices = {
    'menu-customization': {
      name: 'Menü Özelleştirme',
      description: 'Özel tema, logo ve tasarım değişiklikleri',
      panel: 'Menü',
      basePrice: 2500,
      perChange: 500
    },
    'qr-design': {
      name: 'QR Kod Tasarımı',
      description: 'Özel QR kod tasarımı ve yerleşimi',
      panel: 'QR Kodlar',
      basePrice: 1500,
      perChange: 300
    },
    'report-customization': {
      name: 'Rapor Özelleştirme',
      description: 'Özel rapor şablonları ve analitik',
      panel: 'Raporlar',
      basePrice: 3000,
      perChange: 800
    },
    'staff-training': {
      name: 'Personel Eğitimi',
      description: 'Panel kullanımı ve sistem eğitimi',
      panel: 'Personel',
      basePrice: 2000,
      perChange: 500
    },
    'order-integration': {
      name: 'Sipariş Entegrasyonu',
      description: 'POS ve ödeme sistem entegrasyonu',
      panel: 'Siparişler',
      basePrice: 5000,
      perChange: 1500
    },
    'multi-branch-setup': {
      name: 'Çoklu Şube Kurulumu',
      description: 'Ek şube ekleme ve yönetimi',
      panel: 'Genel',
      basePrice: 4000,
      perChange: 2000
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Plan yükseltme fonksiyonları
  const handlePlanUpgrade = (planType: string) => {
    setShowUpgradeModal(true);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newServices = { ...prev };
      if (newServices[serviceId]) {
        delete newServices[serviceId];
      } else {
        newServices[serviceId] = 1;
      }
      return newServices;
    });
  };

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedServices(prev => {
        const newServices = { ...prev };
        delete newServices[serviceId];
        return newServices;
      });
    } else {
      setSelectedServices(prev => ({
        ...prev,
        [serviceId]: quantity
      }));
    }
  };

  const calculateTotalPrice = () => {
    const planPrice = plans[selectedPlan].pricing[billingCycle];
    const servicesPrice = Object.entries(selectedServices).reduce((total, [serviceId, quantity]) => {
      const service = additionalServices[serviceId as keyof typeof additionalServices];
      return total + (service.basePrice + (service.perChange * (quantity - 1)));
    }, 0);
    return planPrice + servicesPrice;
  };

  const getServicesByPanel = (panel: string) => {
    return Object.entries(additionalServices).filter(([_, service]) => service.panel === panel);
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newServices = { ...prev };
      delete newServices[serviceId];
      return newServices;
    });
  };

  const handlePaymentComplete = (paymentData: any) => {
    console.log(`💳 Ödeme tamamlandı:`, paymentData);
    
    // Ödeme başarılı mesajı
    alert(`Ödeme Başarılı! 🎉\n\nPlan: ${paymentData.plan}\nFaturalandırma: ${paymentData.billingCycle}\nTutar: ₺${paymentData.total.toLocaleString('tr-TR')}\nÖdeme Yöntemi: ${paymentData.method}\n\nPlanınız aktifleştirildi!`);
    
    // Modal'ları kapat
      setShowUpgradeModal(false);
    setShowPaymentModal(false);
    setSelectedServices({});
    
    console.log(`✅ Ödeme işlemi tamamlandı: ${paymentData.plan}`);
  };

  const handleCancelPlan = () => {
    setShowUpgradeModal(false);
    setSelectedFeatures([]);
  };

  // Feature kontrolü
  const hasQrMenu = useFeature('qr_menu');
  const hasTableManagement = useFeature('table_management');
  const hasOrderTaking = useFeature('order_taking');
  const hasBasicReports = useFeature('basic_reports');
  const hasStockManagement = useFeature('stock_management');
  const hasAdvancedAnalytics = useFeature('advanced_analytics');

  // Gerçek verileri kullan
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  // Bugünkü siparişler
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startOfDay && orderDate <= endOfDay;
  });
  
  // Bugünkü ciro
  const todayRevenue = todayOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  
  // Bu ayki siparişler
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startOfMonth;
  });
  
  // Aylık ciro
  const monthlyRevenue = monthlyOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  
  const stats = {
    todayOrders: todayOrders.length,
    activeOrders: activeOrders.length,
    todayRevenue,
    monthlyRevenue,
    monthlyOrders: monthlyOrders.length,
    averageRating: 0, // TODO: Rating sistemi eklendiğinde
    customerSatisfaction: 0, // TODO: Memnuniyet sistemi eklendiğinde
    totalMenuItems: menuItems.length,
    activeCategories: categories.length,
    totalWaiters: 0, // TODO: Personel sistemi eklendiğinde
    activeTables: 0 // TODO: Masa sistemi eklendiğinde
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <BusinessSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="ml-0 lg:ml-64">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-30">
          <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FaBars className="text-lg text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Kontrol Paneli</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">Hoş geldiniz, {displayName} 👋</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className={`px-4 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-bold transition-all hover:scale-105 shadow-lg ${
                  (authenticatedRestaurant?.subscription?.plan || 'premium') === 'premium' 
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300'
                }`}
              >
                <span className="hidden sm:inline">
                  {(authenticatedRestaurant?.subscription?.plan || 'premium') === 'premium' ? 'Premium' : 'Premium'} Plan
                </span>
                <span className="sm:hidden">
                  {(authenticatedRestaurant?.subscription?.plan || 'premium') === 'premium' ? 'P' : 'P'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-3 sm:p-6 lg:p-8">

          {/* Support Modal */}
          {showSupportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={()=>setShowSupportModal(false)}>
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden" onClick={(e)=>e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Destek</h3>
                  <button onClick={() => setShowSupportModal(false)} className="text-gray-500 hover:text-gray-700">
                    <FaTimes />
                  </button>
                </div>
                <div className="h-[70vh]">
                  <iframe src="/business/support" className="w-full h-full" />
                </div>
              </div>
            </div>
          )}
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <FaShoppingCart className="text-lg sm:text-2xl text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.todayOrders}</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2 font-medium">Bugünkü Siparişler</p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                  <FaChartLine className="text-lg sm:text-2xl text-green-600" />
                </div>
              </div>
              <h3 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₺{stats.todayRevenue.toLocaleString('tr-TR')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2 font-medium">Bugünkü Ciro</p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                  <FaUtensils className="text-lg sm:text-2xl text-purple-600" />
                </div>
                <span className="text-xs sm:text-sm text-purple-600 font-bold bg-purple-100 px-2 py-1 rounded-full">{stats.activeCategories} kategori</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.totalMenuItems}</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2 font-medium">Menü Ürünleri</p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
                  <FaUsers className="text-lg sm:text-2xl text-orange-600" />
                </div>
                <span className="text-xs sm:text-sm text-orange-600 font-bold bg-orange-100 px-2 py-1 rounded-full">{stats.activeTables} aktif</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{authenticatedRestaurant?.tableCount || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2 font-medium">Toplam Masa</p>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Aktif Siparişler */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Aktif Siparişler</h3>
                <Link href="/business/orders" className="text-purple-600 hover:text-purple-700 text-sm font-bold bg-purple-100 px-3 py-1 rounded-full hover:bg-purple-200 transition-all">
                  Tümünü Gör →
                </Link>
              </div>
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="font-bold text-purple-600 text-lg">{order.tableNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">Masa {order.tableNumber || 'N/A'}</p>
                        <p className="text-sm text-gray-600 font-medium">{order.items?.length || 0} ürün • ₺{order.totalAmount || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-2 rounded-full text-xs font-bold shadow-lg ${
                        order.status === 'ready' 
                          ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                          : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800'
                      }`}>
                        {order.status === 'ready' ? 'Hazır' : 'Hazırlanıyor'}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hızlı İşlemler */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">Hızlı İşlemler</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/business/menu" className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 flex flex-col items-center justify-center gap-3 border border-purple-200/50 hover:shadow-lg hover:scale-105">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaPlus className="text-xl text-white" />
                  </div>
                  <span className="text-sm font-bold text-purple-800">Yeni Ürün</span>
                </Link>
                <Link href="/business/orders" className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 flex flex-col items-center justify-center gap-3 border border-blue-200/50 hover:shadow-lg hover:scale-105">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaEye className="text-xl text-white" />
                  </div>
                  <span className="text-sm font-bold text-blue-800">Siparişleri Gör</span>
                </Link>
                <Link href="/business/menu" className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 flex flex-col items-center justify-center gap-3 border border-green-200/50 hover:shadow-lg hover:scale-105">
                  <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaEdit className="text-xl text-white" />
                  </div>
                  <span className="text-sm font-bold text-green-800">Menüyü Düzenle</span>
                </Link>
                <button data-open-announcements onClick={() => setShowAnnModal(true)} className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 flex flex-col items-center justify-center gap-3 border border-yellow-200/50 hover:shadow-lg hover:scale-105">
                  <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaBullhorn className="text-xl text-white" />
                  </div>
                  <span className="text-sm font-bold text-yellow-800">Duyurular (Aktif)</span>
                </button>
              </div>
            </div>
            <AnnouncementQuickModal isOpen={showAnnModal} onClose={() => setShowAnnModal(false)} />
            <script dangerouslySetInnerHTML={{__html:`
              (function(){
                window.addEventListener('masapp:open-announcements',function(){
                  var e = document.querySelector('[data-open-announcements]');
                  if(e){ e.click(); }
                });
              })();
            `}} />
          </div>

          {/* Aylık Özet */}
          <div className="mt-8 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 rounded-2xl shadow-2xl p-8 text-white hover:shadow-3xl transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold mb-3">Aylık Performans</h3>
                <p className="text-purple-200 mb-6 text-lg">
                  {stats.monthlyOrders > 0 ? 'Bu ay harika gidiyorsunuz! 🚀' : 'Henüz veri bulunmuyor 📊'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                    <p className="text-4xl font-bold mb-2">₺{stats.monthlyRevenue.toLocaleString('tr-TR')}</p>
                    <p className="text-purple-200 text-sm font-medium">Aylık Ciro</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                    <p className="text-4xl font-bold mb-2">{stats.monthlyOrders}</p>
                    <p className="text-purple-200 text-sm font-medium">Toplam Sipariş</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                    <p className="text-4xl font-bold mb-2">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}</p>
                    <p className="text-purple-200 text-sm font-medium">Ortalama Puan</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                    <p className="text-4xl font-bold mb-2">{stats.customerSatisfaction > 0 ? `${stats.customerSatisfaction}%` : '-'}</p>
                    <p className="text-purple-200 text-sm font-medium">Müşteri Memnuniyeti</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Eski Modal - Kaldırıldı */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Plan Yükseltme</h2>
              <button
                onClick={handleCancelPlan}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            {/* Plan Detayları */}
            <div className="p-6">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {selectedPlan}
                </h3>
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  ₺{calculateTotalPrice()}
                </div>
                <div className="text-gray-500">/ay</div>
              </div>

              {/* Özellikler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Dahil Özellikler</h4>
                  <ul className="space-y-3">
                    {selectedFeatures.map((featureId, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-700">{featureId}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Mevcut Planınız</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      Premium Plan
                    </div>
                    <div className="text-2xl font-bold text-gray-600 mb-2">
                      ₺99
                    </div>
                    <div className="text-sm text-gray-500">/ay</div>
                  </div>
                </div>
              </div>

              {/* Ödeme Seçenekleri */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Ödeme Yöntemi</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors text-left">
                    <div className="font-medium text-gray-800">Kredi Kartı</div>
                    <div className="text-sm text-gray-500">Visa, Mastercard</div>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors text-left">
                    <div className="font-medium text-gray-800">Banka Havalesi</div>
                    <div className="text-sm text-gray-500">EFT, Havale</div>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors text-left">
                    <div className="font-medium text-gray-800">Dijital Cüzdan</div>
                    <div className="text-sm text-gray-500">PayPal, Stripe</div>
                  </button>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelPlan}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Ödeme Yap (₺{calculateTotalPrice()})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gelişmiş Paket Yönetimi Modalı */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaCog className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Paket ve Hizmet Yönetimi</h3>
                  <p className="text-gray-600 text-lg">İhtiyacınıza göre plan ve ek hizmetler seçin</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-3 hover:bg-gray-200 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <FaTimes className="text-gray-500 text-2xl" />
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sol Kolon - Plan ve Hizmet Seçimi */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Mevcut Plan */}
                  <div className={`bg-gradient-to-r border-2 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                    selectedPlan === 'corporate' 
                      ? 'from-purple-50 via-purple-100 to-purple-200 border-purple-300' 
                      : 'from-orange-50 via-orange-100 to-orange-200 border-orange-300'
                  }`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                        selectedPlan === 'corporate' ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
                      }`}>
                        <FaCog className="text-white text-xl" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-800">Mevcut Planınız</h4>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className={`text-3xl font-bold mb-2 ${
                          selectedPlan === 'corporate' ? 'text-purple-600' : 'text-orange-600'
                        }`}>
                          {plans[selectedPlan].name}
                        </h5>
                        <p className="text-gray-700 text-lg font-medium">
                          ₺{plans[selectedPlan].pricing[billingCycle].toLocaleString('tr-TR')}
                          {billingCycle === 'monthly' ? '/ay' : 
                           billingCycle === 'sixMonths' ? '/6 ay' : '/yıl'} - Aktif
                        </p>
                      </div>
                      <div className="text-right bg-white/50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 font-medium">Sonraki ödeme</div>
                        <div className="font-bold text-lg">15 Ocak 2024</div>
                      </div>
                    </div>
                  </div>

                  {/* Faturalandırma Seçimi */}
                  <div className="bg-white/80 backdrop-blur-lg border-2 border-gray-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6">Faturalandırma Dönemini Değiştir</h4>
                    <p className="text-gray-600 mb-6 text-lg">Faturalandırma döneminizi değiştirerek tasarruf edebilirsiniz</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                          billingCycle === 'monthly'
                            ? selectedPlan === 'corporate' 
                              ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg'
                              : 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-lg">Aylık</div>
                        <div className="text-sm text-gray-600 mb-3">Her ay ödeme</div>
                        <div className={`text-2xl font-bold ${
                          selectedPlan === 'corporate' ? 'text-purple-600' : 'text-orange-600'
                        }`}>
                          ₺{plans[selectedPlan].pricing.monthly}
                        </div>
                      </button>
                      <button
                        onClick={() => setBillingCycle('sixMonths')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                          billingCycle === 'sixMonths'
                            ? selectedPlan === 'corporate' 
                              ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg'
                              : 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-lg">6 Aylık</div>
                        <div className="text-sm text-gray-600 mb-3">%17 indirim</div>
                        <div className={`text-2xl font-bold ${
                          selectedPlan === 'corporate' ? 'text-purple-600' : 'text-orange-600'
                        }`}>
                          ₺{plans[selectedPlan].pricing.sixMonths}
                        </div>
                      </button>
                      <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                          billingCycle === 'yearly'
                            ? selectedPlan === 'corporate' 
                              ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg'
                              : 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-lg">Yıllık</div>
                        <div className="text-sm text-gray-600 mb-3">%20 indirim</div>
                        <div className={`text-2xl font-bold ${
                          selectedPlan === 'corporate' ? 'text-purple-600' : 'text-orange-600'
                        }`}>
                          ₺{plans[selectedPlan].pricing.yearly}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Ek Hizmetler */}
                  <div className="bg-white/80 backdrop-blur-lg border-2 border-gray-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6">Ek Hizmetler</h4>
                    <p className="text-gray-600 mb-8 text-lg">
                      Dilediğiniz ek hizmet hangi paneldeyse hemen sepete ekleyin. 
                      Birden fazla seçebilirsiniz. Örneğin mutfak panelinde kaç tane değişiklik istiyorsanız 
                      o kadar sayı seçebilirsiniz, fiyat ona göre eklenecektir.
                    </p>
                    
                    <div className="space-y-8">
                      {['Menü', 'QR Kodlar', 'Raporlar', 'Personel', 'Siparişler', 'Genel'].map(panel => {
                        const panelServices = getServicesByPanel(panel);
                        if (panelServices.length === 0) return null;
                        
                        return (
                          <div key={panel} className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-lg transition-all duration-300">
                            <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-3 text-xl">
                              {panel === 'Menü' && <FaUtensils className="text-pink-500 text-2xl" />}
                              {panel === 'QR Kodlar' && <FaQrcode className="text-purple-500 text-2xl" />}
                              {panel === 'Raporlar' && <FaChartBar className="text-blue-500 text-2xl" />}
                              {panel === 'Personel' && <FaUsers className="text-green-500 text-2xl" />}
                              {panel === 'Siparişler' && <FaShoppingCart className="text-orange-500 text-2xl" />}
                              {panel === 'Genel' && <FaCog className="text-gray-500 text-2xl" />}
                              {panel} Paneli
                            </h5>
                            <div className="space-y-4">
                              {panelServices.map(([serviceId, service]) => (
                                <div key={serviceId} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                                  <div className="flex-1">
                                    <h6 className="font-bold text-gray-800 text-lg">{service.name}</h6>
                                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                    <div className="text-sm text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded-full inline-block">
                                      ₺{service.basePrice} + ₺{service.perChange}/değişiklik
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => updateServiceQuantity(serviceId, (selectedServices[serviceId] || 0) - 1)}
                                      className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-300 transition-all duration-300 hover:scale-110"
                                    >
                                      -
                                    </button>
                                    <span className="w-12 text-center font-bold text-lg">
                                      {selectedServices[serviceId] || 0}
                                    </span>
                                    <button
                                      onClick={() => updateServiceQuantity(serviceId, (selectedServices[serviceId] || 0) + 1)}
                                      className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-110"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sağ Kolon - Sepet ve Ödeme */}
                <div className="space-y-8">
                  {/* Sepet */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6">Sepetiniz</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white rounded-xl p-4 border border-gray-200">
                        <span className="text-gray-700 font-bold text-lg">{plans[selectedPlan].name}</span>
                        <span className="font-bold text-xl text-gray-800">₺{plans[selectedPlan].pricing[billingCycle]}</span>
                      </div>
                      {Object.entries(selectedServices).map(([serviceId, quantity]) => {
                        const service = additionalServices[serviceId as keyof typeof additionalServices];
                        const totalPrice = service.basePrice + (service.perChange * (quantity - 1));
                        return (
                          <div key={serviceId} className="flex justify-between items-center bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                            <div className="flex-1">
                              <span className="text-gray-700 font-medium">{service.name}</span>
                              <span className="text-gray-500 text-sm ml-2">({quantity}x)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg text-gray-800">₺{totalPrice}</span>
                              <button
                                onClick={() => removeService(serviceId)}
                                className="text-red-500 hover:text-red-700 text-lg hover:scale-110 transition-all duration-300"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="border-t-2 border-gray-300 pt-4 bg-white rounded-xl p-4">
                        <div className="flex justify-between text-2xl font-bold">
                          <span className="text-gray-800">Toplam</span>
                          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">₺{calculateTotalPrice().toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="text-sm text-gray-600 font-medium mt-2">
                          {billingCycle === 'monthly' ? 'Aylık' : 
                           billingCycle === 'sixMonths' ? '6 Aylık' : 'Yıllık'} ödeme
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ödeme Butonu */}
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Ödeme Yap (₺{calculateTotalPrice().toLocaleString('tr-TR')})
                  </button>

                  {/* Kurumsal Paket Tanıtımı kaldırıldı */}
                  {false && (
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <FaStore className="text-white text-lg" />
                      </div>
                      <div>
                        <h5 className="text-lg font-bold text-purple-800">Kurumsal Paket</h5>
                        <p className="text-sm text-purple-600">Büyük işletmeler ve zincirler için</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-purple-700">Özel Menü ve Logo Entegrasyonu</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-purple-700">Sınırsız kullanıcı (tüm paneller)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-purple-700">Çoklu şube yönetimi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-purple-700">API entegrasyonları</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-purple-700">7/24 Telefon Desteği</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-purple-700">Beyaz Etiket Çözümü</span>
                      </div>
                    </div>
                    
                    {/* Ödeme Bilgileri */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h6 className="font-semibold text-gray-800 mb-3 text-sm">Ödeme Bilgileri</h6>
                      <p className="text-sm text-gray-600 mb-4">Ödeme bilgileriniz güvenli bir şekilde saklanmaktadır.</p>
                      <a href="tel:+905393222797" className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
                        Hemen Arayın
                      </a>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedPlan('corporate');
                        setBillingCycle(corporateBillingCycle);
                        alert('Kurumsal paket seçildi! Faturalandırma dönemini değiştirebilirsiniz.');
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Kurumsal Pakete Geç
                    </button>
        </div>
      )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ödeme Modalı */}
      <BusinessPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={calculateTotalPrice()}
        planName={plans[selectedPlan].name}
        billingCycle={billingCycle === 'monthly' ? 'Aylık' : billingCycle === 'sixMonths' ? '6 Aylık' : 'Yıllık'}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
