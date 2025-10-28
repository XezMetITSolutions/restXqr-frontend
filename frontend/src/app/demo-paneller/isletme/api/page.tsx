'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import { apiService } from '@/services/api';
import { 
  FaCode, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaKey,
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaBars,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaClock
} from 'react-icons/fa';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive';
  permissions: string[];
  requestCount: number;
  lastUsed: string;
  createdAt: string;
  expiresAt: string;
}

export default function ApiPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const hasApiAccess = useFeature('api_access');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);

  useEffect(() => {
    // Demo için session kontrolü yok
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const restaurantId = user?.id;
      if (!restaurantId) return;
      
      const response = await apiService.getApiKeys(restaurantId);
      if (response.success && response.data) {
        setApiKeys(response.data);
      }
    } catch (error) {
      console.error('API keys yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApiKey = async (keyData: Partial<ApiKey>) => {
    try {
      const restaurantId = user?.id;
      if (!restaurantId) return;

      const response = await apiService.createApiKey({
        ...keyData,
        restaurantId
      });
      
      if (response.success) {
        await fetchApiKeys();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('API key eklenirken hata:', error);
    }
  };

  const handleUpdateApiKey = async (id: string, keyData: Partial<ApiKey>) => {
    try {
      const response = await apiService.updateApiKey(id, keyData);
      if (response.success) {
        await fetchApiKeys();
        setEditingKey(null);
      }
    } catch (error) {
      console.error('API key güncellenirken hata:', error);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Bu API key\'i silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await apiService.deleteApiKey(id);
      if (response.success) {
        await fetchApiKeys();
      }
    } catch (error) {
      console.error('API key silinirken hata:', error);
    }
  };

  const handleRegenerateApiKey = async (id: string) => {
    if (!confirm('Bu API key\'i yenilemek istediğinizden emin misiniz? Eski key çalışmayacak.')) return;
    
    try {
      const response = await apiService.regenerateApiKey(id);
      if (response.success) {
        await fetchApiKeys();
      }
    } catch (error) {
      console.error('API key yenilenirken hata:', error);
    }
  };

  // Özellik kontrolü
  if (!hasApiAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FaCode className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">API Yönetimi</h2>
          <p className="text-gray-600 mb-4">
            Bu özellik planınızda bulunmuyor. API erişimi özelliğini kullanmak için planınızı yükseltin.
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
    router.push('/');
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || key.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeKeys = apiKeys.filter(k => k.status === 'active').length;
  const totalRequests = apiKeys.reduce((sum, k) => sum + k.requestCount, 0);
  const avgRequests = Math.round(totalRequests / apiKeys.length);

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
                    <FaCode className="text-indigo-600" />
                    API Yönetimi
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">API anahtarlarınızı yönetin ve izleyin</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <FaPlus />
                <span className="hidden sm:inline">Yeni API Anahtarı</span>
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
                  <p className="text-sm text-gray-600">Toplam Anahtar</p>
                  <p className="text-2xl font-bold text-gray-900">{apiKeys.length}</p>
                </div>
                <FaKey className="text-3xl text-indigo-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif Anahtar</p>
                  <p className="text-2xl font-bold text-green-600">{activeKeys}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam İstek</p>
                  <p className="text-2xl font-bold text-blue-600">{totalRequests.toLocaleString()}</p>
                </div>
                <FaChartLine className="text-3xl text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ort. İstek</p>
                  <p className="text-2xl font-bold text-purple-600">{avgRequests.toLocaleString()}</p>
                </div>
                <FaClock className="text-3xl text-purple-500" />
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
                  placeholder="API anahtarı adı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          {/* API Keys List */}
          <div className="space-y-4">
            {filteredKeys.map((apiKey) => (
              <div key={apiKey.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FaKey className="text-2xl text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{apiKey.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          apiKey.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {apiKey.status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />}
                          {apiKey.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FaEdit />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <FaKey className="text-gray-400" />
                        <code className="text-sm font-mono text-gray-900">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                        >
                          {visibleKeys.has(apiKey.id) ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">İzinler:</p>
                    <div className="flex flex-wrap gap-2">
                      {apiKey.permissions.map((perm) => (
                        <span key={perm} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                          {perm === 'read' ? 'Okuma' : perm === 'write' ? 'Yazma' : 'Silme'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600">İstek Sayısı</p>
                      <p className="text-lg font-bold text-gray-900">{apiKey.requestCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Son Kullanım</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(apiKey.lastUsed).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Geçerlilik</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(apiKey.expiresAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredKeys.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FaKey className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">API anahtarı bulunamadı</p>
            </div>
          )}

          {/* Documentation */}
          <div className="mt-6 bg-indigo-50 rounded-lg p-6 border border-indigo-200">
            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <FaCode />
              API Dokümantasyonu
            </h3>
            <p className="text-sm text-indigo-800 mb-4">
              API'mizi kullanmaya başlamak için dokümantasyonumuzu inceleyin.
            </p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Dokümantasyonu Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




