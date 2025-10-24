'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaChartBar, 
  FaUsers, 
  FaBuilding, 
  FaBell,
  FaCreditCard,
  FaExclamationTriangle,
  FaUserCheck,
  FaShieldAlt,
  FaChartLine,
  FaCog,
  FaQrcode,
  FaFileAlt,
  FaCogs,
  FaDatabase,
  FaLock,
  FaChartPie,
  FaGlobe
} from 'react-icons/fa';
import useRestaurantStore from '@/store/useRestaurantStore';

export default function SuperAdminDashboard() {
  const { restaurants, fetchRestaurants } = useRestaurantStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchRestaurants();
      } catch (error) {
        console.error('Dashboard data loading error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchRestaurants]);

  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.status === 'active').length;
  const totalUsers = restaurants.length; // Restaurant owners as users
  const monthlyRevenue = 0; // TODO: Calculate from orders

  return (
    <AdminLayout title="Süper Yönetici Paneli" description="Sistem genel durumu ve yönetim paneli">
      {/* System Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
          <div className="h-3 w-3 bg-green-500 rounded-full mr-3"></div>
          <span className="text-green-800 font-medium">Sistem: Online</span>
        </div>
      </div>

        {/* Dashboard Content */}
      <main>
          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Toplam Restoran</p>
                  <h3 className="text-3xl font-bold text-gray-900">{isLoading ? '...' : totalRestaurants}</h3>
                  <p className="text-sm text-gray-500 mt-1">{totalRestaurants > 0 ? `${totalRestaurants} restoran kayıtlı` : 'Henüz veri yok'}</p>
                </div>
                <div className="h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FaBuilding className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Aktif Restoran</p>
                  <h3 className="text-3xl font-bold text-gray-900">{isLoading ? '...' : activeRestaurants}</h3>
                  <p className="text-sm text-gray-500 mt-1">{activeRestaurants > 0 ? `${activeRestaurants} aktif restoran` : 'Henüz veri yok'}</p>
                </div>
                <div className="h-16 w-16 bg-green-100 rounded-xl flex items-center justify-center">
                  <FaChartBar className="text-2xl text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Toplam Kullanıcı</p>
                  <h3 className="text-3xl font-bold text-gray-900">{isLoading ? '...' : totalUsers}</h3>
                  <p className="text-sm text-gray-500 mt-1">{totalUsers > 0 ? `${totalUsers} kullanıcı` : 'Henüz veri yok'}</p>
                </div>
                <div className="h-16 w-16 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FaUsers className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Aylık Gelir</p>
                  <h3 className="text-3xl font-bold text-gray-900">₺{isLoading ? '...' : monthlyRevenue.toLocaleString()}</h3>
                  <p className="text-sm text-gray-500 mt-1">{monthlyRevenue > 0 ? 'Bu ay toplam gelir' : 'Henüz veri yok'}</p>
                </div>
                <div className="h-16 w-16 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FaChartLine className="text-2xl text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı Eylemler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı Eylemler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/restaurants/add" className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 text-left transition-colors group">
                <FaBuilding className="text-2xl text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">Restoran Ekle</h3>
                <p className="text-sm text-gray-500">Yeni restoran kaydı</p>
              </Link>
              <Link href="/admin/users" className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 text-left transition-colors group">
                <FaUsers className="text-2xl text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">Kullanıcı Yönet</h3>
                <p className="text-sm text-gray-500">Kullanıcı hesapları</p>
              </Link>
              <Link href="/admin/notifications" className="p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 text-left transition-colors group">
                <FaBell className="text-2xl text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">Bildirim Gönder</h3>
                <p className="text-sm text-gray-500">Toplu bildirim</p>
              </Link>
              <Link href="/admin/settings" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors group">
                <FaCog className="text-2xl text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">Sistem Ayarları</h3>
                <p className="text-sm text-gray-500">Genel ayarlar</p>
              </Link>
            </div>
            
            {/* İkinci Satır - Ek Hızlı İşlemler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <Link href="/admin/qr-management/generate" className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 text-left transition-colors group">
                <FaQrcode className="text-2xl text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">QR Oluştur</h3>
                <p className="text-sm text-gray-500">QR kod üretimi</p>
              </Link>
              <Link href="/admin/reports" className="p-4 border border-gray-200 rounded-lg hover:bg-orange-50 text-left transition-colors group">
                <FaChartPie className="text-2xl text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">Raporlar</h3>
                <p className="text-sm text-gray-500">Sistem raporları</p>
              </Link>
              <Link href="/admin/payment-errors" className="p-4 border border-gray-200 rounded-lg hover:bg-red-50 text-left transition-colors group">
                <FaExclamationTriangle className="text-2xl text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">Ödeme Hataları</h3>
                <p className="text-sm text-gray-500">Hata takibi</p>
              </Link>
              <Link href="/admin/security" className="p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 text-left transition-colors group">
                <FaLock className="text-2xl text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">Güvenlik</h3>
                <p className="text-sm text-gray-500">Güvenlik ayarları</p>
              </Link>
            </div>
          </div>

          {/* Son Aktiviteler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Son Aktiviteler</h2>
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <FaChartBar className="text-4xl mx-auto" />
                  </div>
              <p className="text-gray-500">Henüz aktivite bulunmuyor</p>
              <p className="text-sm text-gray-400">Sistem kullanılmaya başlandığında aktiviteler burada görünecek</p>
            </div>
          </div>
      </main>
    </AdminLayout>
  );
}
