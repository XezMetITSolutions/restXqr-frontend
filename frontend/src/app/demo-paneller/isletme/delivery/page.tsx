'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import { apiService } from '@/services/api';
import { 
  FaTruck, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaBars,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaBox,
  FaMotorcycle
} from 'react-icons/fa';

interface Delivery {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: number;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'on_way' | 'delivered' | 'cancelled';
  deliveryPerson: string;
  estimatedTime: string;
  createdAt: string;
}

export default function DeliveryPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const hasDeliveryIntegration = useFeature('delivery_integration');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
    } else {
      fetchDeliveries();
    }
  }, [isAuthenticated, router]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const restaurantId = user?.id;
      if (!restaurantId) return;
      
      const response = await apiService.getDeliveries(restaurantId);
      if (response.success && response.data) {
        setDeliveries(response.data);
      }
    } catch (error) {
      console.error('Teslimatlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async (deliveryData: Partial<Delivery>) => {
    try {
      const restaurantId = user?.id;
      if (!restaurantId) return;

      const response = await apiService.createDelivery({
        ...deliveryData,
        restaurantId
      });
      
      if (response.success) {
        await fetchDeliveries();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Teslimat eklenirken hata:', error);
    }
  };

  const handleUpdateDelivery = async (id: string, deliveryData: Partial<Delivery>) => {
    try {
      const response = await apiService.updateDelivery(id, deliveryData);
      if (response.success) {
        await fetchDeliveries();
        setEditingDelivery(null);
      }
    } catch (error) {
      console.error('Teslimat güncellenirken hata:', error);
    }
  };

  const handleDeleteDelivery = async (id: string) => {
    if (!confirm('Bu teslimati silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await apiService.deleteDelivery(id);
      if (response.success) {
        await fetchDeliveries();
      }
    } catch (error) {
      console.error('Teslimat silinirken hata:', error);
    }
  };

  // Özellik kontrolü
  if (!hasDeliveryIntegration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Paket Servis Yönetimi</h2>
          <p className="text-gray-600 mb-4">
            Bu özellik planınızda bulunmuyor. Paket servis entegrasyonu özelliğini kullanmak için planınızı yükseltin.
          </p>
          <button
            onClick={() => router.push('/business/settings')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Planı Yükselt
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/isletme-giris');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'preparing': return 'bg-blue-100 text-blue-700';
      case 'on_way': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FaClock />;
      case 'preparing': return <FaBox />;
      case 'on_way': return <FaMotorcycle />;
      case 'delivered': return <FaCheckCircle />;
      case 'cancelled': return <FaTimesCircle />;
      default: return <FaSpinner />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'on_way': return 'Yolda';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.customerPhone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeDeliveries = deliveries.filter(d => d.status === 'on_way').length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending' || d.status === 'preparing').length;
  const deliveredToday = deliveries.filter(d => d.status === 'delivered').length;
  const totalRevenue = deliveries.reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="ml-0 lg:ml-72">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaBars className="text-xl text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaTruck className="text-orange-600" />
                    Paket Servis Yönetimi
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Teslimatları takip edin ve yönetin</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                <FaPlus />
                <span className="hidden sm:inline">Yeni Sipariş</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Yolda</p>
                  <p className="text-2xl font-bold text-purple-600">{activeDeliveries}</p>
                </div>
                <FaMotorcycle className="text-3xl text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bekleyen</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingDeliveries}</p>
                </div>
                <FaClock className="text-3xl text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Teslim Edilen</p>
                  <p className="text-2xl font-bold text-green-600">{deliveredToday}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Ciro</p>
                  <p className="text-2xl font-bold text-orange-600">₺{totalRevenue.toLocaleString()}</p>
                </div>
                <FaTruck className="text-3xl text-orange-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sipariş no, müşteri adı veya telefon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekliyor</option>
                <option value="preparing">Hazırlanıyor</option>
                <option value="on_way">Yolda</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal</option>
              </select>
            </div>
          </div>

          {/* Deliveries List */}
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FaTruck className="text-2xl text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{delivery.orderNumber}</h3>
                        <p className="text-sm text-gray-600">{delivery.customerName}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                      {getStatusIcon(delivery.status)}
                      {getStatusText(delivery.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-900">{delivery.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaPhone className="text-gray-400" />
                        {delivery.customerPhone}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Ürün Sayısı:</span>
                        <span className="font-medium text-gray-900">{delivery.items} adet</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tutar:</span>
                        <span className="font-bold text-green-600">₺{delivery.totalAmount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Kurye:</span>
                        <span className="font-medium text-gray-900">{delivery.deliveryPerson}</span>
                      </div>
                      {delivery.estimatedTime !== '-' && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tahmini Süre:</span>
                          <span className="font-medium text-orange-600">{delivery.estimatedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                      <>
                        <button className="flex-1 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 text-sm font-medium">
                          Durumu Güncelle
                        </button>
                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                          <FaEdit />
                        </button>
                      </>
                    )}
                    {delivery.status === 'delivered' && (
                      <div className="flex-1 text-center text-sm text-green-600 font-medium">
                        ✓ Başarıyla teslim edildi
                      </div>
                    )}
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDeliveries.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FaTruck className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Teslimat bulunamadı</p>
            </div>
          )}

          {/* Integration Info */}
          <div className="mt-6 bg-orange-50 rounded-lg p-6 border border-orange-200">
            <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
              <FaMotorcycle />
              Paket Servis Entegrasyonları
            </h3>
            <p className="text-sm text-orange-800 mb-4">
              Yemeksepeti, Getir Yemek ve Trendyol Yemek ile entegre olun.
            </p>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Entegrasyonları Yönet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



