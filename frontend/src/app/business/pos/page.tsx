'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import { apiService } from '@/services/api';
import { 
  FaCashRegister, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaBars,
  FaSync,
  FaChartLine,
  FaClock,
  FaReceipt
} from 'react-icons/fa';

interface POSDevice {
  id: string;
  name: string;
  deviceId: string;
  location: string;
  status: 'online' | 'offline' | 'syncing';
  lastSync: string;
  todayTransactions: number;
  todayRevenue: number;
  battery: number;
}

export default function POSPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const hasPOSIntegration = useFeature('pos_integration');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [posDevices, setPosDevices] = useState<POSDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDevice, setEditingDevice] = useState<POSDevice | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/business/login');
    } else {
      fetchPOSDevices();
    }
  }, [isAuthenticated, router]);

  const fetchPOSDevices = async () => {
    try {
      setLoading(true);
      const restaurantId = user?.id;
      if (!restaurantId) return;
      
      const response = await apiService.getPOSDevices(restaurantId);
      if (response.success && response.data) {
        setPosDevices(response.data);
      }
    } catch (error) {
      console.error('POS cihazları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPOSDevice = async (deviceData: Partial<POSDevice>) => {
    try {
      const restaurantId = user?.id;
      if (!restaurantId) return;

      const response = await apiService.createPOSDevice({
        ...deviceData,
        restaurantId
      });
      
      if (response.success) {
        await fetchPOSDevices();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('POS cihazı eklenirken hata:', error);
    }
  };

  const handleUpdatePOSDevice = async (id: string, deviceData: Partial<POSDevice>) => {
    try {
      const response = await apiService.updatePOSDevice(id, deviceData);
      if (response.success) {
        await fetchPOSDevices();
        setEditingDevice(null);
      }
    } catch (error) {
      console.error('POS cihazı güncellenirken hata:', error);
    }
  };

  const handleDeletePOSDevice = async (id: string) => {
    if (!confirm('Bu POS cihazını silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await apiService.deletePOSDevice(id);
      if (response.success) {
        await fetchPOSDevices();
      }
    } catch (error) {
      console.error('POS cihazı silinirken hata:', error);
    }
  };

  const handleSyncPOSDevice = async (id: string) => {
    try {
      const response = await apiService.syncPOSDevice(id);
      if (response.success) {
        await fetchPOSDevices();
      }
    } catch (error) {
      console.error('POS cihazı senkronize edilirken hata:', error);
    }
  };

  const oldDemoData = [
    {
      id: '1',
      name: 'Kasa 1 - Ana Salon',
      deviceId: 'POS-001',
      location: 'Ana Salon',
      status: 'online',
      lastSync: new Date().toISOString(),
      todayTransactions: 145,
      todayRevenue: 12450,
      battery: 85
    },
    {
      id: '2',
      name: 'Kasa 2 - Bahçe',
      deviceId: 'POS-002',
      location: 'Bahçe Alanı',
      status: 'online',
      lastSync: new Date(Date.now() - 300000).toISOString(),
      todayTransactions: 89,
      todayRevenue: 7820,
      battery: 92
    },
    {
      id: '3',
      name: 'Kasa 3 - Üst Kat',
      deviceId: 'POS-003',
      location: 'Üst Kat',
      status: 'syncing',
      lastSync: new Date(Date.now() - 600000).toISOString(),
      todayTransactions: 67,
      todayRevenue: 5940,
      battery: 45
    },
    {
      id: '4',
      name: 'Kasa 4 - Paket Servis',
      deviceId: 'POS-004',
      location: 'Paket Servis',
      status: 'offline',
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      todayTransactions: 0,
      todayRevenue: 0,
      battery: 12
    }
  ]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/business/login');
    }
  }, [isAuthenticated, router]);

  // Özellik kontrolü
  if (!hasPOSIntegration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FaCashRegister className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">POS Entegrasyonu</h2>
          <p className="text-gray-600 mb-4">
            Bu özellik planınızda bulunmuyor. POS entegrasyonu özelliğini kullanmak için planınızı yükseltin.
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
    router.push('/business/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-700';
      case 'offline': return 'bg-red-100 text-red-700';
      case 'syncing': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <FaCheckCircle />;
      case 'offline': return <FaTimesCircle />;
      case 'syncing': return <FaSync className="animate-spin" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Çevrimiçi';
      case 'offline': return 'Çevrimdışı';
      case 'syncing': return 'Senkronize Ediliyor';
      default: return status;
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-600';
    if (battery > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredDevices = posDevices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const onlineDevices = posDevices.filter(d => d.status === 'online').length;
  const totalTransactions = posDevices.reduce((sum, d) => sum + d.todayTransactions, 0);
  const totalRevenue = posDevices.reduce((sum, d) => sum + d.todayRevenue, 0);

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
                    <FaCashRegister className="text-teal-600" />
                    POS Entegrasyonu
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">POS cihazlarınızı yönetin ve izleyin</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <FaPlus />
                <span className="hidden sm:inline">Yeni Cihaz</span>
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
                  <p className="text-sm text-gray-600">Toplam Cihaz</p>
                  <p className="text-2xl font-bold text-gray-900">{posDevices.length}</p>
                </div>
                <FaCashRegister className="text-3xl text-teal-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Çevrimiçi</p>
                  <p className="text-2xl font-bold text-green-600">{onlineDevices}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bugünkü İşlem</p>
                  <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
                </div>
                <FaReceipt className="text-3xl text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bugünkü Ciro</p>
                  <p className="text-2xl font-bold text-teal-600">₺{totalRevenue.toLocaleString()}</p>
                </div>
                <FaChartLine className="text-3xl text-teal-500" />
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
                  placeholder="Cihaz adı, ID veya lokasyon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="online">Çevrimiçi</option>
                <option value="offline">Çevrimdışı</option>
                <option value="syncing">Senkronize Ediliyor</option>
              </select>
            </div>
          </div>

          {/* POS Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredDevices.map((device) => (
              <div key={device.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FaCashRegister className="text-2xl text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{device.name}</h3>
                        <p className="text-sm text-gray-600">{device.deviceId}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      {getStatusText(device.status)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Lokasyon:</span>
                      <span className="font-medium text-gray-900">{device.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Son Senkronizasyon:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(device.lastSync).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Batarya:</span>
                      <span className={`font-bold ${getBatteryColor(device.battery)}`}>
                        %{device.battery}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Bugünkü İşlem</p>
                      <p className="text-lg font-bold text-gray-900">{device.todayTransactions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Bugünkü Ciro</p>
                      <p className="text-lg font-bold text-green-600">₺{device.todayRevenue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {device.status !== 'offline' && (
                      <button className="flex-1 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 flex items-center justify-center gap-2 text-sm font-medium">
                        <FaSync />
                        Senkronize Et
                      </button>
                    )}
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      <FaEdit />
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDevices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FaCashRegister className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">POS cihazı bulunamadı</p>
            </div>
          )}

          {/* Integration Info */}
          <div className="mt-6 bg-teal-50 rounded-lg p-6 border border-teal-200">
            <h3 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
              <FaCashRegister />
              Desteklenen POS Sistemleri
            </h3>
            <p className="text-sm text-teal-800 mb-4">
              Olivetti, Hugin, Datecs ve daha fazla POS sistemi ile entegre olun.
            </p>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Entegrasyon Ayarları
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
