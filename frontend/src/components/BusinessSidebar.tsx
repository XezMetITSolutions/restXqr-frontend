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
  FaBars,
  FaRocket,
  FaSparkles
} from 'react-icons/fa';
import { useFeature } from '@/hooks/useFeature';
import { useAuthStore } from '@/store/useAuthStore';
import { useBusinessSettingsStore } from '@/store/useBusinessSettingsStore';
import { useEffect, useState } from 'react';

interface BusinessSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function BusinessSidebar({ sidebarOpen, setSidebarOpen, onLogout }: BusinessSidebarProps) {
  const pathname = usePathname();
  const { authenticatedRestaurant, authenticatedStaff } = useAuthStore();
  const { settings, fetchSettings } = useBusinessSettingsStore();
  const [brandColors, setBrandColors] = useState({
    primary: '#8B5CF6',
    secondary: '#A855F7',
    accent: '#EC4899'
  });
  
  // Feature kontrolü
  const hasQrMenu = useFeature('qr_menu');
  const hasTableManagement = useFeature('table_management');
  const hasBasicReports = useFeature('basic_reports');
  const hasAdvancedAnalytics = useFeature('advanced_analytics');

  // Görsel kimlik ayarlarını yükle
  useEffect(() => {
    if (authenticatedRestaurant?.id) {
      fetchSettings(authenticatedRestaurant.id);
    }
  }, [authenticatedRestaurant?.id, fetchSettings]);

  // Brand renklerini ayarla
  useEffect(() => {
    if (settings?.branding) {
      setBrandColors({
        primary: settings.branding.primaryColor || '#8B5CF6',
        secondary: settings.branding.secondaryColor || '#A855F7',
        accent: settings.branding.accentColor || '#EC4899'
      });
    }
  }, [settings?.branding]);

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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white transform transition-all duration-500 ease-in-out z-50 shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          background: `linear-gradient(135deg, ${brandColors.primary}20, ${brandColors.secondary}30, ${brandColors.accent}20)`
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}
              >
                <FaRocket className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {restaurantName}
                </h1>
                <p className="text-white/70 text-sm font-medium">Yönetim Paneli</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-3 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <FaBars className="text-lg" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  item.active
                    ? 'shadow-lg'
                    : 'hover:shadow-md'
                }`}
                style={{
                  background: item.active 
                    ? `linear-gradient(135deg, ${brandColors.primary}40, ${brandColors.secondary}30)` 
                    : 'transparent',
                  borderLeft: item.active ? `4px solid ${brandColors.accent}` : '4px solid transparent'
                }}
              >
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    item.active ? 'shadow-lg' : 'group-hover:shadow-md'
                  }`}
                  style={{
                    background: item.active 
                      ? `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`
                      : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Icon className={`text-lg transition-all duration-300 ${
                    item.active ? 'text-white' : 'text-white/70 group-hover:text-white'
                  }`} />
                </div>
                <span className={`font-medium transition-all duration-300 ${
                  item.active ? 'text-white font-bold' : 'text-white/80 group-hover:text-white'
                }`}>
                  {item.label}
                </span>
                {item.active && (
                  <div 
                    className="ml-auto w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: brandColors.accent }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${brandColors.secondary}, ${brandColors.accent})` }}
              >
                <span className="text-white font-bold text-lg">
                  {restaurantName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-bold">{restaurantName}</p>
                <p className="text-white/60 text-sm">{restaurantEmail}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-3 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110 group"
              title="Çıkış Yap"
            >
              <FaSignOutAlt className="text-lg text-white/70 group-hover:text-red-400 transition-colors duration-300" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
