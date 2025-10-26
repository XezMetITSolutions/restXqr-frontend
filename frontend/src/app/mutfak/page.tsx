'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  restaurantId: string;
  tableNumber: number;
  customerName?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  notes?: string;
  paymentStatus?: string;
  orderType: string;
  created_at: string;
  items: OrderItem[];
}

interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  isAvailable: boolean;
}

export default function MutfakPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  // Restoran ID'sini al
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`${API_URL}/staff/restaurants`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const aksaray = data.data.find((r: any) => r.username === 'aksaray');
          if (aksaray) {
            setRestaurantId(aksaray.id);
          }
        }
      } catch (error) {
        console.error('Restoran bilgisi alınamadı:', error);
      }
    };

    fetchRestaurant();
  }, []);

  // Siparişleri çek
  const fetchOrders = async (showLoading = true) => {
    if (!restaurantId) return;

    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      // Her 5 saniyede bir yenile
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  // Sipariş durumunu güncelle
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Optimistic update - Hemen görsel değişiklik
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        // Backend'den güncel veriyi al (loading gösterme)
        fetchOrders(false);
      } else {
        // Hata durumunda eski haline dön (loading gösterme)
        fetchOrders(false);
      }
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
      // Hata durumunda eski haline dön (loading gösterme)
      fetchOrders(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  };

  const calculateTime = (dateString: string) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now.getTime() - orderTime.getTime();
    return Math.floor(diffMs / (1000 * 60)); // dakika
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'BEKLEMEDE', bg: '#fff3cd', color: '#856404' };
      case 'preparing':
        return { text: 'HAZIRLANIYOR', bg: '#d4edda', color: '#155724' };
      case 'ready':
        return { text: 'HAZIR', bg: '#cce5ff', color: '#004085' };
      case 'completed':
        return { text: 'TESLİM EDİLDİ', bg: '#d1ecf1', color: '#0c5460' };
      case 'cancelled':
        return { text: 'İPTAL EDİLDİ', bg: '#f8d7da', color: '#721c24' };
      default:
        return { text: 'BİLİNMEYEN', bg: '#f0f0f0', color: '#333' };
    }
  };

  const showOrderDetails = (order: Order) => {
    const details = `
Sipariş Detayları:
-------------------
Masa: ${order.tableNumber}
Durum: ${order.status}
Toplam: ${parseFloat(order.totalAmount.toString()).toFixed(2)}₺
Tarih: ${formatDate(order.created_at)}

Ürünler:
${order.items.map(item => `  - ${item.quantity}x ${item.name} - ${parseFloat(item.price.toString()).toFixed(2)}₺`).join('\n')}
    `;
    alert(details);
  };

  // Menü yönetimi
  const fetchMenuItems = async () => {
    if (!restaurantId) return;

    try {
      setMenuLoading(true);
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu/items`);
      const data = await response.json();

      if (data.success && data.data) {
        setMenuItems(data.data);
      }
    } catch (error) {
      console.error('Menü ürünleri yüklenemedi:', error);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleMenuManagement = () => {
    setShowMenuModal(true);
    fetchMenuItems();
  };

  const updateMenuAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      // Optimistic update - Hemen görsel değişiklik
      setMenuItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, isAvailable } : item
        )
      );

      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAvailable })
      });

      const data = await response.json();
      
      if (data.success) {
        // Backend'den güncel veriyi al
        fetchMenuItems();
      } else {
        // Hata durumunda eski haline dön
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Ürün durumu güncellenemedi:', error);
      // Hata durumunda eski haline dön
      fetchMenuItems();
    }
  };

  // Filtrelenmiş siparişler
  const filteredOrders = orders.filter(order => {
    // Durum filtresi
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    
    // Arama filtresi
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.tableNumber.toString().includes(searchLower) ||
        order.items.some(item => item.name.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Her durumun sayısını hesapla
  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-8 py-6 mb-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-2xl">
              👨‍🍳
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mutfak Paneli</h1>
              <p className="text-gray-600 text-sm">Oda servisi siparişlerini ve menü ürünlerini yönetin</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleMenuManagement}
              className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              + Menü Yönetimi
            </button>
            <div className="px-4 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
              TR Türkçe ↓
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="bg-yellow-50 rounded-2xl p-8 shadow-sm">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Masa numarası veya ürün ara..."
            className="w-full mb-6 px-6 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tümü ({orderCounts.all})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'pending'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Bekleyen ({orderCounts.pending})
            </button>
            <button
              onClick={() => setActiveTab('preparing')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'preparing'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Hazırlanan ({orderCounts.preparing})
            </button>
            <button
              onClick={() => setActiveTab('ready')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'ready'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Teslim Edilen ({orderCounts.ready})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'cancelled'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              İptal Edilen ({orderCounts.cancelled})
            </button>
          </div>

          {/* Orders */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Siparişler yükleniyor...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz sipariş yok</h3>
              <p className="text-gray-600">Yeni siparişler geldiğinde burada görünecek.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const estimatedTime = calculateTime(order.created_at);
                
                return (
                  <div key={order.id} className="bg-white rounded-2xl p-6 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr] gap-6">
                      {/* Sol Sütun - Sipariş Detayları */}
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold text-gray-800">Masa {order.tableNumber}</div>
                            <div className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</div>
                          </div>
                          <div
                            className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                            style={{ background: statusInfo.bg, color: statusInfo.color }}
                          >
                            ⏱️ {statusInfo.text}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 mb-2">Sipariş Detayları:</div>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="text-gray-600">
                                <div>{item.quantity}x {item.name}</div>
                                {item.notes && (
                                  <div className="text-xs text-yellow-700 italic ml-4">
                                    📝 {item.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Orta Sütun - Sipariş Bilgileri */}
                      <div>
                        <div className="font-semibold text-gray-800 mb-3">Sipariş Bilgileri:</div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tahmini Süre:</span>
                            <span className="font-semibold text-gray-800">{estimatedTime} dk</span>
                          </div>
                          {order.notes && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                              <div className="font-semibold text-yellow-800 mb-1">📝 Özel Not:</div>
                              <div className="text-sm text-gray-700">{order.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sağ Sütun - Aksiyon Butonları */}
                      <div className="flex flex-col gap-3">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="px-6 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 justify-center"
                          >
                            ▶ Hazırlığa Başla
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="px-6 py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 justify-center"
                          >
                            ✅ Hazır
                          </button>
                        )}
                        <button 
                          onClick={() => showOrderDetails(order)}
                          className="px-6 py-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2 justify-center"
                        >
                          👁 Detaylar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Menü Yönetimi Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-yellow-400 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">📋 Menü Yönetimi</h2>
              <button 
                onClick={() => setShowMenuModal(false)}
                className="text-gray-900 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {menuLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Menü yükleniyor...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz ürün yok</h3>
                  <p className="text-gray-600">Menüye ürün ekleyin.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {menuItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`bg-white border-2 rounded-lg p-4 ${
                        item.isAvailable ? 'border-green-200' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.isAvailable ? '✓ Mevcut' : '✗ Bitti'}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          <p className="text-lg font-bold text-green-600 mt-2">
                            {parseFloat(item.price.toString()).toFixed(2)}₺
                          </p>
                        </div>
                        <div className="ml-4">
                          {item.isAvailable ? (
                            <button
                              onClick={() => updateMenuAvailability(item.id, false)}
                              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                            >
                              ✗ Bitti
                            </button>
                          ) : (
                            <button
                              onClick={() => updateMenuAvailability(item.id, true)}
                              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                            >
                              ✓ Mevcut
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}