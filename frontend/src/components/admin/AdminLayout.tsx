'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartBar,
  FaUsers,
  FaBuilding,
  FaBell,
  FaCreditCard,
  FaExclamationTriangle,
  FaUserCheck,
  FaSignOutAlt,
  FaShieldAlt,
  FaTimes,
  FaBars,
  FaGlobe,
  FaBox,
  FaCog
} from 'react-icons/fa';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  headerActions?: React.ReactNode;
}

export default function AdminLayout({ 
  children, 
  title, 
  description = "Sistem yönetim paneli",
  headerActions 
}: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white mr-3">
              <FaShieldAlt className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MASAPP</h1>
              <p className="text-sm text-gray-300">Süper Yönetici</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-6">
          <nav className="space-y-2">
            {/* Ana Menü */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ana Menü</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/admin" 
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white ${
                      title === 'Süper Yönetici Paneli' ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <FaChartBar className="mr-3" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/restaurants" 
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white ${
                      title === 'Restoran Yönetimi' ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <FaBuilding className="mr-3" />
                    Restoran Yönetimi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/plans" 
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white ${
                      title === 'Plan Yönetimi' ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <FaBox className="mr-3" />
                    Plan Yönetimi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/restaurant-features" 
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white ${
                      title === 'Restoran Özellik Yönetimi' ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <FaCog className="mr-3" />
                    Özellik Yönetimi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/users" 
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white ${
                      title === 'Kullanıcı Yönetimi' ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <FaUsers className="mr-3" />
                    Kullanıcı Yönetimi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/notifications" 
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white ${
                      title === 'Bildirim Yönetimi' ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <FaBell className="mr-3" />
                    Bildirimler
                  </Link>
                </li>
              </ul>
            </div>

            {/* Raporlar ve Analitik */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Raporlar & Analitik</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/admin/subscriptions" 
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white ${
                      title === 'Abonelik Yönetimi' ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <FaCreditCard className="mr-3" />
                    Abonelik Yönetimi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/payment-errors" 
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white ${
                      title === 'Ödeme Hataları' ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <FaExclamationTriangle className="mr-3" />
                    Ödeme Hataları
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/user-approvals" 
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white ${
                      title === 'Kullanıcı Onayları' ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <FaUserCheck className="mr-3" />
                    Kullanıcı Onayları
                  </Link>
                </li>
              </ul>
            </div>

            {/* Çıkış */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <button 
                onClick={handleLogout}
                className="flex items-center p-3 rounded-lg hover:bg-red-600 text-gray-300 hover:text-white w-full"
              >
                <FaSignOutAlt className="mr-3" />
                Çıkış Yap
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
                >
                  <FaBars className="text-xl" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="text-gray-600 mt-1">{description}</p>
                </div>
              </div>
              {headerActions && (
                <div className="flex space-x-3">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
