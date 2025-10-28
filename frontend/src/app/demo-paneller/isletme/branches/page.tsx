'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import { apiService } from '@/services/api';
import { 
  FaStore, 
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
  FaUsers,
  FaChartLine
} from 'react-icons/fa';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
  openingHours: string;
  employeeCount: number;
  monthlyRevenue: number;
  createdAt: string;
}

export default function BranchesPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const hasMultiBranch = useFeature('multi_branch');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
    } else {
      fetchBranches();
    }
  }, [isAuthenticated, router]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const restaurantId = user?.id;
      if (!restaurantId) return;
      
      const response = await apiService.getBranches(restaurantId);
      if (response.success && response.data) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error('Şubeler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (branchData: Partial<Branch>) => {
    try {
      const restaurantId = user?.id;
      if (!restaurantId) return;

      const response = await apiService.createBranch({
        ...branchData,
        restaurantId
      });
      
      if (response.success) {
        await fetchBranches();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Şube eklenirken hata:', error);
    }
  };

  const handleUpdateBranch = async (id: string, branchData: Partial<Branch>) => {
    try {
      const response = await apiService.updateBranch(id, branchData);
      if (response.success) {
        await fetchBranches();
        setEditingBranch(null);
      }
    } catch (error) {
      console.error('Şube güncellenirken hata:', error);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm('Bu şubeyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await apiService.deleteBranch(id);
      if (response.success) {
        await fetchBranches();
      }
    } catch (error) {
      console.error('Şube silinirken hata:', error);
    }
  };

  // Özellik kontrolü
  if (!hasMultiBranch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Şube Yönetimi</h2>
          <p className="text-gray-600 mb-4">
            Bu özellik planınızda bulunmuyor. Çoklu şube yönetimi özelliğini kullanmak için planınızı yükseltin.
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

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || branch.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeBranches = branches.filter(b => b.status === 'active').length;
  const totalEmployees = branches.reduce((sum, b) => sum + b.employeeCount, 0);
  const totalRevenue = branches.reduce((sum, b) => sum + b.monthlyRevenue, 0);

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
                    <FaStore className="text-blue-600" />
                    Şube Yönetimi
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Tüm şubelerinizi tek yerden yönetin</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPlus />
                <span className="hidden sm:inline">Yeni Şube</span>
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
                  <p className="text-sm text-gray-600">Toplam Şube</p>
                  <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
                </div>
                <FaStore className="text-3xl text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif Şube</p>
                  <p className="text-2xl font-bold text-green-600">{activeBranches}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Çalışan</p>
                  <p className="text-2xl font-bold text-purple-600">{totalEmployees}</p>
                </div>
                <FaUsers className="text-3xl text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aylık Ciro</p>
                  <p className="text-2xl font-bold text-orange-600">₺{totalRevenue.toLocaleString()}</p>
                </div>
                <FaChartLine className="text-3xl text-orange-500" />
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
                  placeholder="Şube adı, şehir veya yönetici ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => (
              <div key={branch.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaStore className="text-2xl text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{branch.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          branch.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {branch.status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />}
                          {branch.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2 text-sm">
                      <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900">{branch.address}</p>
                        <p className="text-gray-600">{branch.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaPhone className="text-gray-400" />
                      {branch.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaClock className="text-gray-400" />
                      {branch.openingHours}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaUsers className="text-gray-400" />
                      Yönetici: {branch.manager}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600">Çalışan</p>
                      <p className="text-lg font-bold text-gray-900">{branch.employeeCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Aylık Ciro</p>
                      <p className="text-lg font-bold text-green-600">
                        {branch.monthlyRevenue > 0 ? `₺${(branch.monthlyRevenue / 1000).toFixed(0)}K` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setEditingBranch(branch)}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2"
                    >
                      <FaEdit />
                      Düzenle
                    </button>
                    <button 
                      onClick={() => handleDeleteBranch(branch.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FaStore className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Şube bulunamadı</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}



