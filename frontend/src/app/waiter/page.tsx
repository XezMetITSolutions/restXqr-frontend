'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaUsers, 
  FaBell,
  FaSearch,
  FaSignOutAlt,
  FaUser,
  FaLock,
  FaUtensils,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import apiService from '@/services/api';
import useRestaurantStore from '@/store/useRestaurantStore';

export default function StandaloneWaiterPage() {
  const router = useRouter();
  const { currentRestaurant } = useRestaurantStore();
  
  // Staff login states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo data states
  const [orders, setOrders] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('orders');

  // Giriş kontrolü
  useEffect(() => {
    const savedStaff = sessionStorage.getItem('waiter_staff');
    if (savedStaff) {
      const staff = JSON.parse(savedStaff);
      if (staff.role === 'waiter') {
        setIsLoggedIn(true);
        setStaffInfo(staff);
        initializeDemoData();
      }
    }
  }, []);

  // Fetch orders from backend
  const fetchOrders = async () => {
    if (!currentRestaurant?.id) return;
    try {
      const response = await apiService.getOrders(currentRestaurant.id);
      if (response.success && Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  };

  // Demo data initialize (gerçek verilerle değiştirildi)
  const initializeDemoData = () => {
    fetchOrders();
    setCalls([]);
  };

  // Periyodik sipariş çekme (5 saniye)
  useEffect(() => {
    if (!isLoggedIn || !currentRestaurant?.id) return;
    
    fetchOrders(); // İlk çekim
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn, currentRestaurant?.id]);

  // Staff login fonksiyonu
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const subdomain = window.location.hostname.split('.')[0];
      const response = await apiService.staffLogin(loginForm.username, loginForm.password, subdomain);
      
      if (response.success && response.data) {
        if (response.data.role === 'waiter') {
          setIsLoggedIn(true);
          setStaffInfo(response.data);
          sessionStorage.setItem('waiter_staff', JSON.stringify(response.data));
          initializeDemoData();
        } else {
          setLoginError('Bu panele erişim yetkiniz yok. Sadece garsonlar giriş yapabilir.');
        }
      } else {
        setLoginError('Kullanıcı adı veya şifre hatalı');
      }
    } catch (error: any) {
      console.error('Staff login error:', error);
      setLoginError(error.message || 'Giriş yapılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const handleLogout = () => {
    setIsLoggedIn(false);
    setStaffInfo(null);
    sessionStorage.removeItem('waiter_staff');
  };

  // Sipariş servis etme
  const handleServeOrder = (orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
    alert('Sipariş servis edildi!');
  };

  // Çağrıyı çözme
  const handleResolveCall = (callId: string) => {
    setCalls(prev => prev.filter(call => call.id !== callId));
    alert('Çağrı çözüldü!');
  };

  // Login formu
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-2xl text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Garson Paneli</h1>
            <p className="text-gray-600 mt-2">Garson girişi</p>
          </div>

          <form onSubmit={handleStaffLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kullanıcı adınızı girin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Şifrenizi girin"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <FaUsers />
                  Garson Paneline Giriş
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Giriş bilgilerinizi personel yönetiminden alabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block bg-white bg-opacity-20 p-3 rounded-lg">
              <FaUsers className="text-2xl" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">Garson Paneli</h2>
              <p className="text-blue-100 text-xs sm:text-sm hidden sm:block">Hoş geldiniz, {staffInfo?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleLogout}
              className="px-2 sm:px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <FaSignOutAlt className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'orders'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaUtensils className="inline mr-2" />
              Siparişler ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('calls')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'calls'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaBell className="inline mr-2" />
              Çağrılar ({calls.length})
            </button>
          </div>
        </div>

        {/* Siparişler Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Hazır Siparişler</h3>
            </div>

            <div className="divide-y divide-gray-200">
              {orders.map(order => (
                <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          Masa {order.tableNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.guests} kişi
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.orderTime).toLocaleTimeString('tr-TR')}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'ready' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {order.status === 'ready' ? 'Hazır' : 'Hazırlanıyor'}
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {item.name} x{item.quantity}
                              {item.status === 'ready' && (
                                <FaCheckCircle className="text-green-500 text-xs" />
                              )}
                              {item.status === 'preparing' && (
                                <FaClock className="text-orange-500 text-xs" />
                              )}
                            </span>
                            <span>₺{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="text-sm text-gray-600 italic mb-2">
                          Not: {order.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-gray-900">
                          Toplam: ₺{order.totalAmount}
                        </div>
                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleServeOrder(order.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                          >
                            <FaUtensils />
                            Servis Et
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12">
                <FaUtensils className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Hazır sipariş yok</p>
              </div>
            )}
          </div>
        )}

        {/* Çağrılar Tab */}
        {activeTab === 'calls' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Müşteri Çağrıları</h3>
            </div>

            <div className="divide-y divide-gray-200">
              {calls.map(call => (
                <div key={call.id} className="p-4 sm:p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          Masa {call.tableNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(call.timestamp).toLocaleTimeString('tr-TR')}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          call.type === 'service' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {call.type === 'service' ? 'Servis' : 'Hesap'}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-3">
                        {call.message}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {Math.floor((Date.now() - new Date(call.timestamp).getTime()) / (1000 * 60))} dakika önce
                        </div>
                        <button
                          onClick={() => handleResolveCall(call.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <FaCheckCircle />
                          Çözüldü
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {calls.length === 0 && (
              <div className="text-center py-12">
                <FaBell className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aktif çağrı yok</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}