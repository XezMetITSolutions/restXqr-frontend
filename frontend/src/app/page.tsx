'use client';

import Link from 'next/link';
import { FaQrcode, FaUtensils, FaShoppingCart, FaBell, FaMagic, FaChartLine, FaUsers, FaClock, FaCheckCircle, FaRocket, FaShieldAlt, FaStar, FaPhone, FaWhatsapp } from 'react-icons/fa';
import { LanguageProvider } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';

export default function Home() {
  return (
    <LanguageProvider>
      <main className="min-h-screen bg-white relative">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full shadow-lg mb-6 text-lg font-semibold backdrop-blur-md border border-white/30">
            <FaStar className="text-yellow-200 mr-3" /> 
            <TranslatedText>120+ Restoran Güveniyor</TranslatedText>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            <TranslatedText>Restoranınız</TranslatedText> <span className="text-white"><TranslatedText>Dijital Çağa</TranslatedText></span><br/><TranslatedText>Hazır mı?</TranslatedText>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-orange-50 leading-relaxed max-w-4xl mx-auto font-medium">
            🚀 <TranslatedText>Türkiye'nin en gelişmiş QR menü ve sipariş yönetim sistemi ile</TranslatedText> <br/>
            <span className="text-white font-bold"><TranslatedText>satışlarınızı %300 artırın!</TranslatedText></span> <TranslatedText>Rakiplerinizi geride bırakın.</TranslatedText>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-2xl mx-auto">
            <Link href="/panels" className="bg-white text-orange-600 px-8 py-4 rounded-2xl text-lg font-black flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              <FaUsers className="text-xl" /> <TranslatedText>Panelleri Görüntüle</TranslatedText>
            </Link>
            <Link href="/panels" className="bg-orange-700 hover:bg-orange-800 text-white px-8 py-4 rounded-2xl text-lg font-black transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              <FaRocket className="inline mr-3 text-xl" /> <TranslatedText>Demo İncele</TranslatedText>
            </Link>
          </div>
        </div>
      </section>

      

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-blue-900 mb-6 text-center">Hizmetlerimiz</h2>
          <p className="text-2xl text-blue-700 max-w-4xl mx-auto mb-16 text-center">
            Restoranınızı dijital dünyaya taşıyacak kapsamlı çözümlerimizi keşfedin.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaQrcode className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4 text-center"><TranslatedText>QR Menü Sistemi</TranslatedText></h3>
              <p className="text-blue-700 mb-4 text-center"><TranslatedText>Temassız menü deneyimi</TranslatedText></p>
              <ul className="text-left space-y-2 text-sm text-blue-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Anlık menü güncelleme</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Çoklu dil desteği</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Mobil uyumlu tasarım</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Hijyen güvencesi</TranslatedText></li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingCart className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-4 text-center"><TranslatedText>Akıllı Sipariş Yönetimi</TranslatedText></h3>
              <p className="text-emerald-700 mb-4 text-center"><TranslatedText>Otomatik sipariş akışı</TranslatedText></p>
              <ul className="text-left space-y-2 text-sm text-emerald-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Gerçek zamanlı takip</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Öncelik sıralaması</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Otomatik bildirimler</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Hata önleme</TranslatedText></li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-violet-200 hover:border-violet-400 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaChartLine className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-violet-900 mb-4 text-center"><TranslatedText>Analitik & Raporlama</TranslatedText></h3>
              <p className="text-violet-700 mb-4 text-center"><TranslatedText>Detaylı iş zekası</TranslatedText></p>
              <ul className="text-left space-y-2 text-sm text-violet-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Satış analizleri</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Müşteri davranışları</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Performans metrikleri</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Kar marjı analizi</TranslatedText></li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaMagic className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-4 text-center"><TranslatedText>AI Menü Optimizasyonu</TranslatedText></h3>
              <p className="text-amber-700 mb-4 text-center"><TranslatedText>Yapay zeka destekli öneriler</TranslatedText></p>
              <ul className="text-left space-y-2 text-sm text-amber-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Fiyat optimizasyonu</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Popüler ürün analizi</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Stok yönetimi</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Trend tahminleri</TranslatedText></li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-rose-200 hover:border-rose-400 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-rose-900 mb-4 text-center"><TranslatedText>Güvenli Ödeme Sistemi</TranslatedText></h3>
              <p className="text-rose-700 mb-4 text-center"><TranslatedText>PCI DSS uyumlu güvenlik</TranslatedText></p>
              <ul className="text-left space-y-2 text-sm text-rose-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Kredi kartı güvenliği</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>SSL şifreleme</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Fraud koruması</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Güvenli API</TranslatedText></li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-slate-200 hover:border-slate-400 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-slate-500 to-gray-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUsers className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center"><TranslatedText>Çoklu Panel Yönetimi</TranslatedText></h3>
              <p className="text-slate-700 mb-4 text-center"><TranslatedText>Entegre işletme sistemi</TranslatedText></p>
              <ul className="text-left space-y-2 text-sm text-slate-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Mutfak paneli</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Garson paneli</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Kasa paneli</TranslatedText></li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> <TranslatedText>Yönetim paneli</TranslatedText></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-indigo-900 mb-6 text-center">restXqr ile Kazançlarınız</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaChartLine className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">%95 Daha Az Hata</h3>
              <p className="text-gray-600">Sistemsel yaklaşım ile insan hatalarını ortadan kaldırın</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaRocket className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">%300 Verimlilik Artışı</h3>
              <p className="text-gray-600">Otomatik süreçler ile zaman ve kaynak tasarrufu</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUsers className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Müşteri Memnuniyeti</h3>
              <p className="text-gray-600">Daha hızlı servis, doğru siparişler, daha iyi deneyim</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Sistemimizi İnceleyin</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            restXqr'in nasıl çalıştığını görmek için panelleri inceleyin. Gerçek restoran deneyimini yaşayın!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/menu" className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg">
              <FaUtensils className="inline mr-2" />
              Menüyü İncele
            </Link>
            <Link href="/panels" className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg">
              <FaUsers className="inline mr-2" />
              Panelleri Görüntüle
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Müşterilerimiz Ne Diyor?</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            120+ restoran restXqr ile operasyonlarını dijitalleştirdi ve müşteri memnuniyetini artırdı.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "restXqr sayesinde siparişlerdeki hatalar %90 azaldı. Müşterilerimiz artık daha hızlı servis alıyor ve memnuniyet oranımız arttı."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  AK
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ahmet Kaya</p>
                  <p className="text-sm text-gray-500">Lezzet Durağı - İstanbul</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "QR menü sistemi müşterilerimizin çok hoşuna gitti. Özellikle pandemi sonrası temassız hizmet çok önemli oldu."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  MÖ
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mehmet Özkan</p>
                  <p className="text-sm text-gray-500">Cafe Corner - Ankara</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "AI menü optimizasyonu harika! Ürün fotoğraflarımız artık çok daha profesyonel görünüyor. Satışlarımız %25 arttı."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  SY
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Selin Yılmaz</p>
                  <p className="text-sm text-gray-500">Bistro 34 - İzmir</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 text-center">Sıkça Sorulan Sorular</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            restXqr hakkında merak ettiklerinizin cevapları burada. Başka sorularınız için bize ulaşın!
          </p>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-orange-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaQrcode className="text-orange-500 mr-3" />
                  restXqr nedir?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  restXqr, menüden siparişe, personelden muhasebeye kadar tüm operasyonu tek platformda yöneten restoran işletim sistemidir. AI ile görsellerinizi profesyonelleştirir, menüyü optimize eder ve satışları artırır; POS ve muhasebe sistemlerinizle sorunsuz entegre olur.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaRocket className="text-blue-500 mr-3" />
                  Kurulum süreci nasıl işliyor?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  6 ay ve üzeri planlar için kurulum tamamen ücretsizdir. Uzman teknik ekibimiz restoranınıza gelir, 
                  sistemi kurar ve tüm personellerinizi eğitir. Kurulum süreci 1-2 gün sürer ve hemen kullanmaya başlayabilirsiniz.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaShieldAlt className="text-green-500 mr-3" />
                  İade garantisi nasıl çalışır?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  30 gün içinde herhangi bir sebeple memnun kalmazsanız, ücretinizi tam olarak iade ediyoruz. 
                  Kurulum yapılmış ise sadece kurulum maliyeti kesilerek kalan tutar iade edilir. Risk almadan deneyin!
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaShoppingCart className="text-purple-500 mr-3" />
                  Hangi ödeme yöntemlerini kabul ediyorsunuz?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Kredi kartı, banka kartı, havale/EFT ve tüm mobil ödeme seçeneklerini kabul ediyoruz. 
                  6 aylık ve yıllık ödemeler için büyük indirimler sunuyoruz. Taksit seçenekleri de mevcuttur.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaPhone className="text-red-500 mr-3" />
                  Teknik destek sağlıyor musunuz?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Elbette! Premium pakette WhatsApp ve öncelikli destek, Kurumsal pakette 7/24 telefon desteği sunuyoruz. 
                  Ayrıca tüm müşterilerimiz için online eğitim videoları ve dokümantasyon sağlıyoruz.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-yellow-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaClock className="text-yellow-500 mr-3" />
                  Sistemi öğrenmek ne kadar sürer?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  restXqr çok kullanıcı dostu tasarlandı. Personelleriniz 1-2 saatte sistemi öğrenebilir. 
                  Kurulum sırasında detaylı eğitim veriyoruz ve sürekli destek sağlıyoruz.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-indigo-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaUtensils className="text-indigo-500 mr-3" />
                  Mevcut POS sistemimle uyumlu mu?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  restXqr bağımsız çalışır ancak mevcut POS sistemlerinizle entegre edilebilir. 
                  Kurumsal pakette API entegrasyonları ile tüm sistemlerinizi birbirine bağlayabilirsiniz.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-pink-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaChartLine className="text-pink-500 mr-3" />
                  Raporlama özellikleri neler?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Günlük/haftalık/aylık satış raporları, en çok satan ürünler, masa verimliliği, 
                  personel performansı ve müşteri analitikleri gibi detaylı raporlar alabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-8">Hemen Başlayın!</h2>
          <p className="text-2xl mb-12 text-orange-50 max-w-3xl mx-auto font-medium">
            🚀 Restoranınızı bugün dijital dünyaya taşıyın! <br/>
            <span className="text-white font-bold">14 gün ücretsiz deneme</span> ile risk almadan başlayın.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
            <a href="tel:+905393222797" className="bg-white text-orange-600 px-10 py-5 rounded-2xl text-xl font-black flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              <FaPhone className="text-2xl" /> Hemen Bizi Arayın
            </a>
            <Link href="/panels" className="bg-orange-700 hover:bg-orange-800 text-white px-10 py-5 rounded-2xl text-xl font-black transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              <FaRocket className="inline mr-3 text-2xl" /> Demo İncele
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-800 py-20 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 bg-orange-500 rounded-xl flex items-center justify-center text-white mr-4">
              <FaUtensils size={20} />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">restXqr</h3>
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Türkiye'nin en gelişmiş QR menü ve restoran yönetim sistemi. 
                120+ restoranın güvendiği çözümle satışlarınızı artırın.
              </p>
              <div className="flex space-x-4">
                <a href="tel:+905393222797" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-300 flex items-center gap-2">
                  <FaPhone /> Hemen Arayın
                </a>
                <a href="https://wa.me/905393222797" target="_blank" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-300 flex items-center gap-2">
                  <FaWhatsapp /> WhatsApp
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6 text-gray-800">Hizmetlerimiz</h4>
              <ul className="space-y-3">
                <li className="text-gray-600 flex items-center gap-2"><FaQrcode className="text-orange-500" /> QR Menü Sistemi</li>
                <li className="text-gray-600 flex items-center gap-2"><FaShoppingCart className="text-orange-500" /> Akıllı Sipariş Yönetimi</li>
                <li className="text-gray-600 flex items-center gap-2"><FaChartLine className="text-orange-500" /> Analitik & Raporlama</li>
                <li className="text-gray-600 flex items-center gap-2"><FaMagic className="text-orange-500" /> AI Menü Optimizasyonu</li>
                <li className="text-gray-600 flex items-center gap-2"><FaShieldAlt className="text-orange-500" /> Güvenli Ödeme Sistemi</li>
                <li className="text-gray-600 flex items-center gap-2"><FaUsers className="text-orange-500" /> Çoklu Panel Yönetimi</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-600 mb-4 md:mb-0">
                <p>&copy; 2025 restXqr. Tüm hakları saklıdır.</p>
                <p className="text-sm mt-1">Türkiye'nin öncü restoran dijitalleştirme platformu</p>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-gray-600 flex items-center gap-2">
                  <FaShieldAlt className="text-orange-500" />
                  SSL Güvenli
                </span>
                <span className="text-gray-600 flex items-center gap-2">
                  <FaStar className="text-orange-500" />
                  120+ Restoran
                </span>
                <span className="text-gray-600 flex items-center gap-2">
                  <FaPhone className="text-orange-500" />
                  7/24 Destek
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </main>
    </LanguageProvider>
  );
}


