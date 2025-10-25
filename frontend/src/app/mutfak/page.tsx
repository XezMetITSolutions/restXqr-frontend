'use client';

import { useState, useEffect } from 'react';
import { FaFire, FaUtensils, FaCheckCircle, FaClock, FaPlay } from 'react-icons/fa';

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
  orderType: string;
  created_at: string;
  items: OrderItem[];
}

export default function MutfakPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('');

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

  // Siparişleri çek (sadece pending ve preparing)
  const fetchOrders = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        // Sadece mutfağın ilgilenmesi gereken siparişler
        const activeOrders = (data.data || []).filter(
          (order: Order) => order.status === 'pending' || order.status === 'preparing'
        );
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      // Her 3 saniyede bir yenile
      const interval = setInterval(fetchOrders, 3000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  // Sipariş durumunu güncelle
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchOrders(); // Listeyi yenile
      }
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // dakika
    
    if (diff < 1) return 'Az önce';
    if (diff === 1) return '1 dakika önce';
    return `${diff} dakika önce`;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaFire className="text-4xl text-orange-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">Mutfak Paneli</h1>
                <p className="text-gray-400">Aksaray Restoran</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{orders.length}</div>
                <div className="text-sm text-gray-400">Aktif Sipariş</div>
              </div>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                Yenile
              </button>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-400 text-lg">Siparişler yükleniyor...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <FaUtensils className="text-8xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">Tüm Siparişler Tamamlandı</h3>
            <p className="text-gray-500">Yeni siparişler burada görünecek</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className={`rounded-lg shadow-lg p-6 ${
                  order.status === 'pending' 
                    ? 'bg-yellow-900 border-2 border-yellow-500' 
                    : 'bg-gray-800 border-2 border-blue-500'
                }`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{order.tableNumber}</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">Masa {order.tableNumber}</div>
                      <div className="text-sm text-gray-400">{formatTime(order.created_at)}</div>
                    </div>
                  </div>
                  {order.status === 'pending' && (
                    <div className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                      YENİ
                    </div>
                  )}
                  {order.status === 'preparing' && (
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <FaClock className="animate-spin" />
                      HAZIRLANIYOR
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="border-t border-b border-gray-700 py-4 mb-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="bg-gray-900 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-lg font-bold text-white">
                            {item.quantity}x {item.name}
                          </div>
                        </div>
                        {item.notes && (
                          <div className="bg-yellow-900 text-yellow-200 p-2 rounded text-sm mt-2">
                            <strong>📝 Not:</strong> {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                {order.notes && (
                  <div className="mb-4 p-3 bg-yellow-900 text-yellow-200 rounded-lg">
                    <strong>⚠️ Özel Not:</strong> {order.notes}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FaPlay />
                      Hazırlamaya Başla
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FaCheckCircle />
                      Hazır - Servise Gönder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
