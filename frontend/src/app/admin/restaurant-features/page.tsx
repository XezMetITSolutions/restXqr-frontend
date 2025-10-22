'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import useRestaurantStore from '@/store/useRestaurantStore';
import { FaSave, FaStar, FaCrown, FaGem, FaCheck } from 'react-icons/fa';
import { Restaurant } from '@/types';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'premium' | 'enterprise' | 'custom';
  icon: string;
}

const availableFeatures: Feature[] = [
  // Basic Features
  { id: 'qr_menu', name: 'QR Menü', description: 'Dijital menü sistemi', category: 'basic', icon: '📱' },
  { id: 'table_management', name: 'Masa Yönetimi', description: 'Masa takip sistemi', category: 'basic', icon: '🪑' },
  { id: 'order_taking', name: 'Sipariş Alma', description: 'Temel sipariş sistemi', category: 'basic', icon: '📝' },
  { id: 'basic_reports', name: 'Temel Raporlar', description: 'Günlük satış raporları', category: 'basic', icon: '📊' },
  
  // Premium Features
  { id: 'google_reviews', name: 'Google Yorumlar', description: 'Google yorum entegrasyonu', category: 'premium', icon: '⭐' },
  { id: 'online_ordering', name: 'Online Sipariş', description: 'Web siparişi alma', category: 'premium', icon: '🛒' },
  { id: 'loyalty_program', name: 'Sadakat Programı', description: 'Müşteri puan sistemi', category: 'premium', icon: '🎁' },
  { id: 'stock_management', name: 'Stok Yönetimi', description: 'Detaylı stok takibi', category: 'premium', icon: '📦' },
  { id: 'advanced_analytics', name: 'Gelişmiş Analitik', description: 'Detaylı analiz raporları', category: 'premium', icon: '📈' },
  { id: 'custom_branding', name: 'Özel Marka', description: 'Logo ve tema özelleştirme', category: 'premium', icon: '🎨' },
  { id: 'multi_language', name: 'Çoklu Dil', description: 'Farklı dil desteği', category: 'premium', icon: '🌐' },
  { id: 'reservation_system', name: 'Rezervasyon', description: 'Masa rezervasyon sistemi', category: 'premium', icon: '📅' },
  
  // Enterprise Features
  { id: 'multi_branch', name: 'Çoklu Şube', description: 'Şube yönetimi', category: 'enterprise', icon: '🏢' },
  { id: 'api_access', name: 'API Erişimi', description: 'REST API entegrasyonu', category: 'enterprise', icon: '🔌' },
  { id: 'white_label', name: 'White Label', description: 'Kendi markanız altında', category: 'enterprise', icon: '👔' },
  { id: 'dedicated_support', name: 'Özel Destek', description: '7/24 özel destek hattı', category: 'enterprise', icon: '☎️' },
  { id: 'custom_development', name: 'Özel Geliştirme', description: 'İsteğe özel kodlama', category: 'enterprise', icon: '⚙️' },
  
  // Custom Features
  { id: 'whatsapp_integration', name: 'WhatsApp Entegrasyonu', description: 'WhatsApp üzerinden sipariş', category: 'custom', icon: '💬' },
  { id: 'delivery_integration', name: 'Paket Servis Entegrasyonu', description: 'Yemeksepeti, Getir vb.', category: 'custom', icon: '🚗' },
  { id: 'pos_integration', name: 'POS Entegrasyonu', description: 'Kasa sistemi bağlantısı', category: 'custom', icon: '💳' },
  { id: 'accounting_integration', name: 'Muhasebe Entegrasyonu', description: 'Muhasebe yazılımı bağlantısı', category: 'custom', icon: '💰' },
  { id: 'custom_reports', name: 'Özel Raporlar', description: 'İsteğe özel rapor şablonları', category: 'custom', icon: '📋' },
  { id: 'employee_scheduling', name: 'Personel Çizelgeleme', description: 'Vardiya planlama sistemi', category: 'custom', icon: '👥' },
  { id: 'inventory_alerts', name: 'Stok Uyarıları', description: 'Otomatik stok bildirimleri', category: 'custom', icon: '🔔' },
  { id: 'customer_feedback', name: 'Müşteri Geri Bildirimi', description: 'Anket ve değerlendirme', category: 'custom', icon: '💬' },
];

export default function RestaurantFeaturesManagement() {
  const { restaurants, updateRestaurant, fetchRestaurants, updateRestaurantFeatures } = useRestaurantStore();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Backend'den restaurant verilerini çek
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

  useEffect(() => {
    if (selectedRestaurant?.features) {
      setSelectedFeatures(selectedRestaurant.features);
      setHasChanges(false);
    } else {
      setSelectedFeatures([]);
    }
  }, [selectedRestaurant]);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRestaurant) return;
    try {
      // Backend API kullan
      await updateRestaurantFeatures(selectedRestaurant.id, selectedFeatures);
      setHasChanges(false);
      alert(`✅ ${selectedRestaurant.name} için özellikler kaydedildi!\n\nAktif özellikler: ${selectedFeatures.length}`);
      
      // Verileri yenile
      fetchRestaurants();
    } catch (e: any) {
      alert(`❌ Kaydetme hatası: ${e?.message || 'Bilinmeyen hata'}`);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-gray-50 border-gray-200';
      case 'premium': return 'bg-yellow-50 border-yellow-200';
      case 'enterprise': return 'bg-purple-50 border-purple-200';
      case 'custom': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const featuresByCategory = {
    basic: availableFeatures.filter(f => f.category === 'basic'),
    premium: availableFeatures.filter(f => f.category === 'premium'),
    enterprise: availableFeatures.filter(f => f.category === 'enterprise'),
    custom: availableFeatures.filter(f => f.category === 'custom'),
  };

  return (
    <AdminLayout title="Restoran Özellik Yönetimi">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Restoran Özellik Yönetimi</h1>
        <p className="text-gray-600 mt-1">Restoran seçin ve özelliklerini yönetin</p>
      </div>

      {/* Restaurant Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restoran Seçin
        </label>
        <select
          value={selectedRestaurantId}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">-- Restoran Seçin --</option>
          {restaurants.map(restaurant => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name} ({restaurant.subscription?.plan?.toUpperCase() || 'BASIC'}) - {restaurant.features?.length || 0} özellik
            </option>
          ))}
        </select>
      </div>

      {selectedRestaurant ? (
        <>
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  {selectedRestaurant.name} - {(selectedRestaurant.subscription?.plan || 'basic').toUpperCase()} Plan
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Aktif Özellikler:</strong> {selectedFeatures.length}</li>
                  <li>• Checkbox işaretleyerek özellik ekle/çıkar yapabilirsiniz</li>
                  <li>• Değişiklikleri kaydetmeyi unutmayın</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="mb-6">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
              >
                <FaSave />
                Değişiklikleri Kaydet ({selectedFeatures.length} özellik)
              </button>
            </div>
          )}

          {/* Features by Category */}
          <div className="space-y-8">
            {/* Basic Features */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaStar className="text-gray-600 text-xl" />
                <h2 className="text-xl font-semibold text-gray-800">Temel Özellikler</h2>
                <span className="text-sm text-gray-500">(Tüm planlara önerilir)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuresByCategory.basic.map(feature => (
                  <label
                    key={feature.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedFeatures.includes(feature.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${getCategoryColor(feature.category)}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{feature.icon}</span>
                        <h3 className="font-semibold text-gray-800 text-sm">{feature.name}</h3>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Premium Features */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaCrown className="text-yellow-600 text-xl" />
                <h2 className="text-xl font-semibold text-gray-800">Premium Özellikler</h2>
                <span className="text-sm text-gray-500">(Premium+ planlara önerilir)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuresByCategory.premium.map(feature => (
                  <label
                    key={feature.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedFeatures.includes(feature.id)
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${getCategoryColor(feature.category)}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="mt-1 w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{feature.icon}</span>
                        <h3 className="font-semibold text-gray-800 text-sm">{feature.name}</h3>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Enterprise Features */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaGem className="text-purple-600 text-xl" />
                <h2 className="text-xl font-semibold text-gray-800">Enterprise Özellikler</h2>
                <span className="text-sm text-gray-500">(Enterprise plana önerilir)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuresByCategory.enterprise.map(feature => (
                  <label
                    key={feature.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedFeatures.includes(feature.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${getCategoryColor(feature.category)}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{feature.icon}</span>
                        <h3 className="font-semibold text-gray-800 text-sm">{feature.name}</h3>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Features */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaGem className="text-blue-600 text-xl" />
                <h2 className="text-xl font-semibold text-gray-800">Özel Özellikler</h2>
                <span className="text-sm text-gray-500">(Talep üzerine verilir)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuresByCategory.custom.map(feature => (
                  <label
                    key={feature.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedFeatures.includes(feature.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${getCategoryColor(feature.category)}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{feature.icon}</span>
                        <h3 className="font-semibold text-gray-800 text-sm">{feature.name}</h3>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button at Bottom */}
          {hasChanges && (
            <div className="fixed bottom-8 right-8 z-50">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full hover:bg-green-700 transition-colors font-semibold shadow-lg"
              >
                <FaSave className="text-xl" />
                Kaydet ({selectedFeatures.length} özellik)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Lütfen bir restoran seçin</p>
        </div>
      )}
    </AdminLayout>
  );
}
