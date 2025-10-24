'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResponsiveTable from '@/components/ResponsiveTable';
import AdminLayout from '@/components/admin/AdminLayout';
import useRestaurantStore from '@/store/useRestaurantStore';
import { Restaurant } from '@/types';
import Modal from '@/components/Modal';
import AddRestaurantForm from './add/AddRestaurantForm';
import EditRestaurantForm from './EditRestaurantForm';
import { 
  FaBuilding, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaStar,
  FaUsers,
  FaQrcode,
  FaLock
} from 'react-icons/fa';

export default function RestaurantsManagement() {
  const router = useRouter();
  const { restaurants, deleteRestaurant, fetchRestaurants, loading } = useRestaurantStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Backend'den restaurant verilerini çek
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'pending': return 'Beklemede';
      case 'suspended': return 'Askıya Alındı';
      default: return status;
    }
  };

  const getCategoryClass = (category: string) => {
    switch(category) {
      case 'İtalyan': return 'bg-red-100 text-red-800';
      case 'Fast Food': return 'bg-orange-100 text-orange-800';
      case 'Japon': return 'bg-blue-100 text-blue-800';
      case 'Kahve': return 'bg-yellow-100 text-yellow-800';
      case 'Et Restoranı': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Restoran',
      sortable: true,
      render: (value: string, row: Restaurant) => (
        <div className="flex items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
            <FaBuilding className="text-gray-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{row.subscription?.plan || 'Basic'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Durum',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusClass(value)}`}>
          {getStatusText(value)}
        </span>
      )
    },
    {
      key: 'tableCount',
      label: 'Masa Sayısı',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center">
          <FaUsers className="text-blue-500 mr-1" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'subscription',
      label: 'Abonelik',
      sortable: true,
      render: (value: any) => (
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            value?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {value?.plan || 'Basic'}
          </span>
        </div>
      )
    },
    {
      key: 'ownerId',
      label: 'Sahip ID',
      sortable: true
    },
    {
      key: 'createdAt',
      label: 'Kayıt Tarihi',
      sortable: true,
      render: (value: Date) => new Date(value).toLocaleDateString('tr-TR')
    }
  ];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all';
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleRestaurantAction = async (action: string, restaurant: Restaurant) => {
    setIsLoading(true);
    try {
      // Demo: Restoran işlemi simülasyonu
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`${action} işlemi:`, restaurant);
      
      // Farklı aksiyonlar için gerçek işlevler
      switch(action) {
        case 'view':
          // Müşteri menüsüne yönlendir (restoran username ile)
          const slug = restaurant.username || restaurant.id;
          window.open(`/menu?restaurant=${slug}`, '_blank');
          break;
        case 'edit':
          setSelectedRestaurant(restaurant);
          setEditModalOpen(true);
          break;
        case 'changePassword':
          // Şifre değiştirme için restoran düzenleme modalını aç
          setSelectedRestaurant(restaurant);
          setEditModalOpen(true);
          // Modal açıldıktan sonra şifre değiştirme bölümünü otomatik aç
          setTimeout(() => {
            const passwordButton = document.querySelector('[data-password-toggle]') as HTMLButtonElement;
            if (passwordButton) {
              passwordButton.click();
            }
          }, 100);
          break;
        case 'delete':
          if (confirm('Bu restoranı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            try {
              // Backend'den sil
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${restaurant.id}`, {
                method: 'DELETE',
              });
              
              if (!response.ok) {
                throw new Error('Restoran silinemedi');
              }
              
              // Zustand store'dan da sil
              deleteRestaurant(restaurant.id);
              
              alert('Restoran başarıyla silindi!');
              
              // Listeyi yenile
              await fetchRestaurants();
            } catch (error) {
              console.error('Silme hatası:', error);
              alert('Restoran silinirken bir hata oluştu!');
            }
          }
          
          // Görünümü güncelle
            router.refresh();
          break;
        default:
          console.log(`${action} işlemi tamamlandı`);
      }
    } catch (error) {
      console.error('Restaurant action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRestaurant = () => {
    setAddModalOpen(true);
  };

  const handleBulkApprove = () => {
    const pendingRestaurants = restaurants.filter(r => r.status === 'pending');
    if (pendingRestaurants.length === 0) {
      return;
    }
    
    // Beklemedeki restoranları aktif yap
    restaurants.forEach(restaurant => {
      if (restaurant.status === 'pending') {
        restaurant.status = 'active';
      }
    });
    
    // Sayfayı yenile
    router.refresh();
  };

  const handleQRManagement = () => {
    // QR kod yönetimi sayfasına yönlendir
    router.push('/admin/qr-management');
  };

  const handleFilter = () => {
    // Filtreleme zaten otomatik olarak çalışıyor, sadece scroll yap
    document.querySelector('.bg-white.rounded-lg.shadow-sm.border.border-gray-200.overflow-hidden')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AdminLayout title="Restoran Yönetimi" description="Restoranları yönetin ve izleyin">
      <div className="flex justify-end px-8 py-4">
              <button 
                onClick={handleAddRestaurant}
                disabled={isLoading}
                className="bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <FaPlus className="mr-2" />
                Yeni Restoran
              </button>
              <button 
                onClick={handleBulkApprove}
                disabled={isLoading}
          className="bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 px-4 py-2 rounded-lg flex items-center transition-colors ml-3"
              >
                <FaCheck className="mr-2" />
                Toplu Onay
              </button>
              <button 
                onClick={handleQRManagement}
                disabled={isLoading}
          className="bg-purple-100 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed text-purple-700 px-4 py-2 rounded-lg flex items-center transition-colors ml-3"
              >
                <FaQrcode className="mr-2" />
                QR Kodlar
              </button>
      </div>

      {/* Filters */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Restoran adı, kategori veya adres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="İtalyan">İtalyan</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Japon">Japon</option>
                <option value="Kahve">Kahve</option>
                <option value="Et Restoranı">Et Restoranı</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="pending">Beklemede</option>
                <option value="suspended">Askıya Alındı</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={handleFilter}
                disabled={isLoading}
                className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
              >
                <FaFilter className="mr-2" />
                Filtrele
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FaBuilding className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Restoran</p>
                <p className="text-2xl font-bold text-gray-900">{restaurants.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FaCheck className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktif Restoran</p>
                <p className="text-2xl font-bold text-gray-900">{restaurants.filter(r => r.status === 'active').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <FaTimes className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Beklemede</p>
                <p className="text-2xl font-bold text-gray-900">{restaurants.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <FaUsers className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-gray-900">{restaurants.reduce((sum, r) => sum + (r.totalOrders || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="px-8">
        <ResponsiveTable
          columns={columns}
          data={filteredRestaurants}
          onAction={handleRestaurantAction}
          mobileView="card"
          isLoading={isLoading}
        />
      </div>
      
      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Yeni Restoran Ekle">
        <AddRestaurantForm onClose={() => {
          setAddModalOpen(false);
          fetchRestaurants(); // Listeyi yenile
        }} />
      </Modal>

      {selectedRestaurant && (
        <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title={`Düzenle: ${selectedRestaurant.name}`}>
          <EditRestaurantForm 
            restaurantId={selectedRestaurant.id} 
            onClose={() => setEditModalOpen(false)} 
          />
        </Modal>
      )}
    </AdminLayout>
  );
}
