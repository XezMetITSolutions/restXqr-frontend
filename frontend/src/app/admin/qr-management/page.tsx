'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaQrcode, 
  FaStore,
  FaDownload,
  FaPrint,
  FaSearch,
  FaCheckCircle,
  FaBan,
  FaPlus,
  FaEye
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import { useQRStore } from '@/store/useQRStore';
import { QRCode } from '@/types';

export default function QRManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { qrCodes, generateQRCodes, activateQRCode, deactivateQRCode } = useQRStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    restaurantId: '',
    restaurantName: '',
    restaurantSlug: '',
    tableCount: 10
  });

  // Demo restoranlar
  const restaurants = [
    { id: 'rest_1', name: 'Lezzet Durağı', slug: 'lezzet-duragi' },
    { id: 'rest_2', name: 'Deniz Restaurant', slug: 'deniz-restaurant' },
    { id: 'rest_3', name: 'Köfte Evi', slug: 'kofte-evi' }
  ];

  // Demo QR kodları
  const demoQRCodes: QRCode[] = [
    {
      id: 'qr_1_1',
      restaurantId: 'rest_1',
      tableNumber: 1,
      code: 'MASAPP_REST1_T1',
      url: 'https://masapp.com/r/lezzet-duragi/masa/1',
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 'qr_1_2',
      restaurantId: 'rest_1',
      tableNumber: 2,
      code: 'MASAPP_REST1_T2',
      url: 'https://masapp.com/r/lezzet-duragi/masa/2',
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 'qr_2_1',
      restaurantId: 'rest_2',
      tableNumber: 1,
      code: 'MASAPP_REST2_T1',
      url: 'https://masapp.com/r/deniz-restaurant/masa/1',
      isActive: true,
      createdAt: new Date()
    }
  ];

  useEffect(() => {
    if (!user || user.role !== 'super_admin') {
      router.push('/admin/login');
    }
  }, [user, router]);

  const filteredQRCodes = demoQRCodes.filter(qr => {
    if (selectedRestaurant !== 'all' && qr.restaurantId !== selectedRestaurant) {
      return false;
    }
    if (searchTerm && !qr.code.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleGenerate = () => {
    if (generateForm.restaurantId && generateForm.tableCount > 0) {
      generateQRCodes(
        generateForm.restaurantId,
        generateForm.restaurantSlug,
        generateForm.tableCount
      );
      setShowGenerateModal(false);
      setGenerateForm({
        restaurantId: '',
        restaurantName: '',
        restaurantSlug: '',
        tableCount: 10
      });
    }
  };

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant?.name || 'Bilinmeyen Restoran';
  };

  return (
    <AdminLayout title="QR Kod Yönetimi" description="QR kodları yönetin ve izleyin">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">MasApp Admin</h1>
          <p className="text-blue-200 text-sm mt-1">Sistem Yönetimi</p>
        </div>

        <nav className="mt-6">
          <Link href="/admin/dashboard" className="flex items-center px-6 py-3 hover:bg-blue-700 hover:bg-opacity-50 transition-colors">
            <FaStore className="mr-3" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/restaurants" className="flex items-center px-6 py-3 hover:bg-blue-700 hover:bg-opacity-50 transition-colors">
            <FaStore className="mr-3" />
            <span>Restoranlar</span>
          </Link>
          <Link href="/admin/qr-management" className="flex items-center px-6 py-3 bg-blue-700 bg-opacity-50 border-l-4 border-white">
            <FaQrcode className="mr-3" />
            <span>QR Yönetimi</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">QR Kod Yönetimi</h2>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" />
              QR Kod Oluştur
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Filtreler */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="QR kod ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Restoranlar</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* QR Kod Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredQRCodes.map((qr) => (
              <div key={qr.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{getRestaurantName(qr.restaurantId)}</h3>
                    <p className="text-sm text-gray-500">Masa {qr.tableNumber}</p>
                  </div>
                  {qr.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                      <FaCheckCircle className="mr-1" size={10} />
                      Aktif
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                      <FaBan className="mr-1" size={10} />
                      Pasif
                    </span>
                  )}
                </div>

                {/* QR Kod Görsel */}
                <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-center">
                  <div className="bg-white p-4 rounded">
                    <FaQrcode className="text-6xl text-gray-700" />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Kod:</span> {qr.code}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    <span className="font-medium">URL:</span> {qr.url}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center text-sm">
                    <FaDownload className="mr-1" />
                    İndir
                  </button>
                  <button className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center text-sm">
                    <FaPrint className="mr-1" />
                    Yazdır
                  </button>
                  <button className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center text-sm">
                    <FaEye className="mr-1" />
                    Önizle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Kod Oluşturma Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">QR Kod Oluştur</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restoran Seçin
                </label>
                <select
                  value={generateForm.restaurantId}
                  onChange={(e) => {
                    const restaurant = restaurants.find(r => r.id === e.target.value);
                    setGenerateForm({
                      ...generateForm,
                      restaurantId: e.target.value,
                      restaurantName: restaurant?.name || '',
                      restaurantSlug: restaurant?.slug || ''
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Restoran seçin...</option>
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Masa Sayısı
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={generateForm.tableCount}
                  onChange={(e) => setGenerateForm({ ...generateForm, tableCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {generateForm.restaurantId && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">{generateForm.tableCount}</span> adet QR kod oluşturulacak.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Her masa için benzersiz QR kod üretilecektir.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleGenerate}
                disabled={!generateForm.restaurantId || generateForm.tableCount < 1}
                className={`flex-1 py-2 rounded-lg text-white ${
                  !generateForm.restaurantId || generateForm.tableCount < 1
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
