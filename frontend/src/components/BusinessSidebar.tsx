'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaChartLine,
  FaUtensils,
  FaUsers,
  FaQrcode,
  FaChartBar,
  FaHeadset,
  FaCog,
  FaSignOutAlt,
  FaBars
} from 'react-icons/fa';
import { useFeature } from '@/hooks/useFeature';
import { useAuthStore } from '@/store/useAuthStore';

interface BusinessSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function BusinessSidebar({ sidebarOpen, setSidebarOpen, onLogout }: BusinessSidebarProps) {
  const pathname = usePathname();
  const { authenticatedRestaurant, authenticatedStaff } = useAuthStore();
  
  // Feature kontrolü
  const hasQrMenu = useFeature('qr_menu');
  const hasTableManagement = useFeature('table_management');
  const hasBasicReports = useFeature('basic_reports');
  const hasAdvancedAnalytics = useFeature('advanced_analytics');

  // Restoran bilgileri - subdomain'e göre kişiselleştir
  const getRestaurantInfo = () => {
    if (typeof window !== 'undefined') {
      const subdomain = window.location.hostname.split('.')[0];
      switch (subdomain) {
        case 'lezzet':
          return {
            name: 'Lezzet Restaurant',
            email: 'info@lezzetrestaurant.com'
          };
        case 'kardesler':
          return {
            name: 'Kardeşler Lokantası', 
            email: 'iletisim@kardeslerlokantasi.com'
          };
        case 'pizza':
          return {
            name: 'Pizza Palace',
            email: 'orders@pizzapalace.com'
          };
        case 'cafe':
          return {
            name: 'Cafe Central',
            email: 'hello@cafecentral.com'
          };
        default:
          return {
            name: authenticatedRestaurant?.name || authenticatedStaff?.name || 'MasApp',
            email: authenticatedRestaurant?.email || authenticatedStaff?.email || 'info@masapp.com'
          };
      }
    }
    return {
      name: authenticatedRestaurant?.name || authenticatedStaff?.name || 'MasApp',
      email: authenticatedRestaurant?.email || authenticatedStaff?.email || 'info@masapp.com'
    };
  };
  
  const { name: restaurantName, email: restaurantEmail } = getRestaurantInfo();

  const allMenuItems = [
    {
      href: '/business/dashboard',
      icon: FaChartLine,
      label: 'Kontrol Paneli',
      active: pathname === '/business/dashboard',
      visible: true // Her zaman görünür
    },
    {
      href: '/business/menu',
      icon: FaUtensils,
      label: 'Menü Yönetimi',
      active: pathname === '/business/menu',
      visible: hasQrMenu // Sadece qr_menu varsa
    },
    {
      href: '/business/staff',
      icon: FaUsers,
      label: 'Personel',
      active: pathname === '/business/staff',
      visible: true // Her zaman görünür
    },
    {
      href: '/business/qr-codes',
      icon: FaQrcode,
      label: 'QR Kodlar',
      active: pathname === '/business/qr-codes',
      visible: hasQrMenu || hasTableManagement // qr_menu veya table_management varsa
    },
    {
      href: '/business/reports',
      icon: FaChartBar,
      label: 'Raporlar',
      active: pathname === '/business/reports',
      visible: hasBasicReports || hasAdvancedAnalytics // basic_reports veya advanced_analytics varsa
    },
    {
      href: '/business/settings',
      icon: FaCog,
      label: 'Ayarlar',
      active: pathname === '/business/settings',
      visible: true // Her zaman görünür
    },
    {
      href: '/business/support',
      icon: FaHeadset,
      label: 'Destek',
      active: pathname === '/business/support',
      visible: true // Her zaman görünür
    }
  ];

  // Sadece görünür menüleri filtrele
  const menuItems = allMenuItems.filter(item => item.visible);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{restaurantName}</h1>
              <p className="text-purple-200 text-xs sm:text-sm mt-1">Yönetim Paneli</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <FaBars className="text-lg" />
            </button>
          </div>

          <nav className="mt-4 sm:mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 transition-colors rounded-r-lg mx-2 sm:mx-0 ${
                    item.active
                      ? 'bg-purple-700 bg-opacity-50 border-l-4 border-white'
                      : 'hover:bg-purple-700 hover:bg-opacity-50'
                  }`}
                >
                  <Icon className="mr-2 sm:mr-3 text-sm sm:text-base" />
                  <span className="text-sm sm:text-base font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="border-t border-purple-700 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">{restaurantName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{restaurantName}</p>
                  <p className="text-xs text-purple-300">{restaurantEmail}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
                title="Çıkış Yap"
              >
                <FaSignOutAlt className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
