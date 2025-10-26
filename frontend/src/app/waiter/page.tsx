'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaWater, 
  FaReceipt, 
  FaSprayCan, 
  FaPlus, 
  FaCheck,
  FaArrowLeft,
  FaBell
} from 'react-icons/fa';
import { useCartStore } from '@/store';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';
import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';
import SetBrandColor from '@/components/SetBrandColor';

function WaiterPageContent() {
  const { currentLanguage, translate } = useLanguage();
  const tableNumber = useCartStore(state => state.tableNumber);
  const { settings } = useBusinessSettingsStore();
  
  const [specialRequest, setSpecialRequest] = useState('');
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const primary = settings.branding.primaryColor;

  useEffect(() => {
    // Sayfa yüklendiğinde aktif istekleri kontrol et
    checkActiveRequests();
  }, []);

  const checkActiveRequests = async () => {
    // Burada backend'den aktif istekleri çekeceğiz
    // Şimdilik boş
  };

  const handleQuickRequest = async (type: string) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const request = {
        type,
        tableNumber,
        timestamp: new Date().toISOString()
      };
      
      // Backend'e isteği gönder
      // await apiService.sendWaiterRequest(request);
      
      // Simüle edilmiş yanıt
      setActiveRequests(prev => [...prev, {
        id: Date.now().toString(),
        ...request,
        status: 'active'
      }]);
      
      // Başarı bildirimi
      console.log('✅ İstek gönderildi:', type);
    } catch (error) {
      console.error('❌ İstek gönderilemedi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpecialRequest = async () => {
    if (!specialRequest.trim() || isSubmitting) return>
    
    setIsSubmitting(true);
    
    try {
      const request = {
        type: 'special_request',
        message: specialRequest,
        tableNumber,
        timestamp: new Date().toISOString()
      };
      
      // Backend'e isteği gönder
      // await apiService.sendWaiterRequest(request);
      
      // Simüle edilmiş yanıt
      setActiveRequests(prev => [...prev, {
        id: Date.now().toString(),
        ...request,
        status: 'active'
      }]);
      
      // Input'u temizle
      setSpecialRequest('');
      
      // Başarı bildirimi
      console.log('✅ Özel istek gönderildi');
    } catch (error) {
      console.error('❌ Özel istek gönderilemedi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case 'water_request': return 'Su Getir';
      case 'bill_request': return 'Hesap İste';
      case 'clean_request': return 'Masayı Temizle';
      case 'help_request': return 'Yardım Gerekiyor';
      case 'special_request': return 'Özel İstek';
      default: return 'Garson Çağır';
    }
  };

  const quickRequests = [
    { type: 'water_request', icon: FaWater, text: 'Su Getir', tr: 'Su Getir', en: 'Get Water' },
    { type: 'bill_request', icon: FaReceipt, text: 'Hesap İste', tr: 'Hesap İste', en: 'Request Bill' },
    { type: 'clean_request', icon: FaSprayCan, text: 'Masayı Temizle', tr: 'Masayı Temizle', en: 'Clean Table' },
    { type: 'help_request', icon: FaPlus, text: 'Yardım Gerekiyor', tr: 'Yardım Gerekiyor', en: 'Need Help' }
  ];

  return (
    <SetBrandColor>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/menu" 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft style={{ color: primary }} />
              </Link>
              <h1 className="text-xl font-bold" style={{ color: primary }}>
                <TranslatedText>Garson Çağır</TranslatedText>
              </h1>
              {tableNumber && (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  <TranslatedText>Masa</TranslatedText> #{tableNumber}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: primary }}
              >
                TR
              </button>
              <button className="px-3 py-1 rounded-lg text-sm font-medium bg-white text-gray-600 border border-gray-200">
                EN
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Hızlı İstekler */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              <TranslatedText>Hızlı İstekler</TranslatedText>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickRequests.map((request) => {
                const IconComponent = request.icon;
                const requestText = currentLanguage === 'tr' ? request.tr : request.en;
                
                return (
                  <button
                    key={request.type}
                    onClick={() => handleQuickRequest(request.type)}
                    disabled={isSubmitting}
                    className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: primary,
                      minHeight: '120px'
                    }}
                  >
                    <IconComponent className="text-4xl mb-3" />
                    <span className="text-sm font-semibold">{requestText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Özel İstek */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              <TranslatedText>Özel İstek</TranslatedText>
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <textarea
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder={currentLanguage === 'tr' ? 'İsteğinizi buraya yazın...' : 'Write your request here...'}
                className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--tone1-border)',
                  focusRingColor: primary
                }}
              />
              <button
                onClick={handleSpecialRequest}
                disabled={!specialRequest.trim() || isSubmitting}
                className="w-full mt-3 py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primary }}
              >
                <TranslatedText>İstek Gönder</TranslatedText>
              </button>
            </div>
          </div>

          {/* Aktif İstekler */}
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ color: primary }}>
              <TranslatedText>Aktif İstekler</TranslatedText>
            </h2>
            {activeRequests.length === 0 ? (
              <div className="bg-gray-100 rounded-xl py-8 text-center">
                <p className="text-gray-500">
                  <TranslatedText>Aktif istek yok</TranslatedText>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: primary, opacity: 0.1 }}
                      >
                        <FaBell style={{ color: primary }} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {getRequestTypeText(request.type)}
                        </p>
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-1">
                            {request.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: primary + '20',
                        color: primary
                      }}
                    >
                      <TranslatedText>Beklemede</TranslatedText>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </SetBrandColor>
  );
}

export default function WaiterPage() {
  return (
    <LanguageProvider>
      <WaiterPageContent />
    </LanguageProvider>
  );
}

