'use client';

import Link from 'next/link';
import { FaBell, FaUtensils, FaDollarSign, FaBuilding, FaArrowLeft, FaCheckCircle, FaUsers, FaChartLine, FaClock, FaShieldAlt, FaPlus, FaStar } from 'react-icons/fa';
import { LanguageProvider } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';

export default function PanelsPage() {
  return (
    <LanguageProvider>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center text-orange-600 hover:text-orange-700 transition-colors">
                <FaArrowLeft className="mr-2" />
                <span className="font-semibold">Ana Sayfaya Dön</span>
              </Link>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">restXqr Panelleri</h1>
                <p className="text-gray-600 mt-1">Restoran operasyonlarınızı yönetin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <TranslatedText>Restoran Yönetim Panelleri</TranslatedText>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              <TranslatedText>restXqr ile restoranınızın tüm operasyonlarını tek platformdan yönetin. 
              Her departman için özel tasarlanmış paneller ile verimliliğinizi artırın.</TranslatedText>
            </p>
          </div>
        </section>

        {/* Panels Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              
              {/* Garson Paneli */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="bg-white/20 p-4 rounded-xl mr-6">
                    <FaBell className="text-4xl text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Garson Paneli</h3>
                    <p className="text-blue-100">Siparişleri yönet ve müşteri çağrılarını gör</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Gerçek zamanlı sipariş takibi</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Müşteri çağrı bildirimleri</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Sipariş durumu güncelleme</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Masa yönetimi</span>
                  </li>
                </ul>
                <Link href="/panels/waiter" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-block">
                  Demo Paneli Görüntüle
                </Link>
              </div>

              {/* Mutfak Paneli */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="bg-white/20 p-4 rounded-xl mr-6">
                    <FaUtensils className="text-4xl text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Mutfak Paneli</h3>
                    <p className="text-orange-100">Siparişleri hazırla ve durumları güncelle</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Sipariş kuyruğu yönetimi</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Hazırlık süresi takibi</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Stok uyarıları</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Otomatik bildirimler</span>
                  </li>
                </ul>
                <Link href="/panels/kitchen" className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors inline-block">
                  Demo Paneli Görüntüle
                </Link>
              </div>

              {/* Kasa Paneli */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="bg-white/20 p-4 rounded-xl mr-6">
                    <FaDollarSign className="text-4xl text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Kasa Paneli</h3>
                    <p className="text-green-100">Ödemeleri al ve kasa işlemlerini yönet</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Hesap ödeme işlemleri</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Fatura ve makbuz yazdırma</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Günlük kasa raporları</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Ödeme yöntemi analizi</span>
                  </li>
                </ul>
                <Link href="/panels/cashier" className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors inline-block">
                  Demo Paneli Görüntüle
                </Link>
              </div>

              {/* İşletme Paneli */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="bg-white/20 p-4 rounded-xl mr-6">
                    <FaBuilding className="text-4xl text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">İşletme Paneli</h3>
                    <p className="text-purple-100">Restoranı yönet ve istatistikleri gör</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Detaylı satış analizleri</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Menü yönetimi</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Personel performans takibi</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-300 mr-3" />
                    <span>Müşteri analitikleri</span>
                  </li>
                </ul>
                <Link href="/panels/business" className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors inline-block">
                  Demo Paneli Görüntüle
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* Demo Menu Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              <TranslatedText>Demo Menü</TranslatedText>
            </h2>
            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
              <TranslatedText>restXqr QR menü sisteminin nasıl çalıştığını görmek için demo menümüzü inceleyin</TranslatedText>
            </p>
            
            {/* Demo Menu Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-bold text-gray-900 mb-2">Arama</h3>
                <p className="text-sm text-gray-600">Menüde hızlı arama</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="font-bold text-gray-900 mb-2">Kampanyalar</h3>
                <p className="text-sm text-gray-600">Günlük özel indirimler</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="text-4xl mb-4">🍲</div>
                <h3 className="font-bold text-gray-900 mb-2">Günün Çorbası</h3>
                <p className="text-sm text-gray-600">Her gün farklı lezzet</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="font-bold text-gray-900 mb-2">Değerlendirme</h3>
                <p className="text-sm text-gray-600">Google yorumları</p>
              </div>
            </div>

            {/* Demo Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Demo Item 1 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105">
                <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative">
                  <span className="text-white text-6xl">🍲</span>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-sm font-medium">Popüler</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Günün Çorbası</h3>
                  <p className="text-gray-600 mb-4">Ezogelin çorbası - Ev yapımı lezzet</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-600">₺25</span>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                      <FaPlus className="inline mr-2" />
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              </div>

              {/* Demo Item 2 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105">
                <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center relative">
                  <span className="text-white text-6xl">🎉</span>
                  <div className="absolute top-4 right-4 bg-red-500 rounded-full px-3 py-1">
                    <span className="text-white text-sm font-medium">%20 İndirim</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bugüne Özel!</h3>
                  <p className="text-gray-600 mb-4">Tüm tatlılarda %20 indirim - Sadece bugün geçerli</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg text-gray-400 line-through">₺22</span>
                      <span className="text-2xl font-bold text-green-600 ml-2">₺18</span>
                    </div>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                      <FaPlus className="inline mr-2" />
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              </div>

              {/* Demo Item 3 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative">
                  <span className="text-white text-6xl">⭐</span>
                  <div className="absolute top-4 right-4 bg-yellow-400 rounded-full px-3 py-1">
                    <span className="text-white text-sm font-medium">5.0</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Google'da Değerlendir</h3>
                  <p className="text-gray-600 mb-4">Yorum Yap</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">Ücretsiz</span>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                      <FaStar className="inline mr-2" />
                      Değerlendir
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Demo Menu CTA */}
            <div className="text-center mt-12">
              <Link href="/panels/menu" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl inline-block">
                <TranslatedText>Demo Menüyü Görüntüle</TranslatedText>
              </Link>
              <p className="text-gray-600 mt-4">
                <TranslatedText>Gerçek QR menü deneyimi için demo sayfamızı ziyaret edin</TranslatedText>
              </p>
            </div>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              <TranslatedText>Neden restXqr Panelleri?</TranslatedText>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUsers className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  <TranslatedText>Çoklu Kullanıcı Desteği</TranslatedText>
                </h3>
                <p className="text-gray-600">
                  <TranslatedText>Her departman için ayrı yetki seviyeleri ile güvenli çoklu kullanıcı yönetimi</TranslatedText>
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaChartLine className="text-3xl text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  <TranslatedText>Gerçek Zamanlı Analitik</TranslatedText>
                </h3>
                <p className="text-gray-600">
                  <TranslatedText>Canlı veriler ile anlık kararlar alın ve performansınızı artırın</TranslatedText>
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaShieldAlt className="text-3xl text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  <TranslatedText>Güvenli ve Stabil</TranslatedText>
                </h3>
                <p className="text-gray-600">
                  <TranslatedText>SSL şifreleme ve 99.9% uptime garantisi ile güvenli operasyon</TranslatedText>
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              <TranslatedText>Hemen Başlayın!</TranslatedText>
            </h2>
            <p className="text-xl mb-8 text-orange-50 max-w-2xl mx-auto">
              <TranslatedText>restXqr panellerini 14 gün ücretsiz deneyin ve restoranınızın verimliliğini artırın.</TranslatedText>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/menu" className="bg-white text-orange-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-orange-50 transition-colors">
                <TranslatedText>Menüyü İncele</TranslatedText>
              </Link>
              <a href="tel:+905393222797" className="bg-orange-700 hover:bg-orange-800 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-colors">
                <TranslatedText>Hemen Arayın</TranslatedText>
              </a>
            </div>
          </div>
        </section>

      </main>
    </LanguageProvider>
  );
}
