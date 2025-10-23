'use client';

import { useState } from 'react';
import { FaTimes, FaGlassWater, FaBroom, FaReceipt, FaUtensils, FaPaperPlane } from 'react-icons/fa';
import { useLanguage, LanguageProvider } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';
import useRestaurantStore from '@/store/useRestaurantStore';
import { useCartStore } from '@/store';

interface QuickServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function QuickServiceModalContent({ isOpen, onClose }: QuickServiceModalProps) {
  const { currentLanguage } = useLanguage();
  const { restaurants } = useRestaurantStore();
  const tableNumber = useCartStore(state => state.tableNumber);
  const [customNote, setCustomNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Subdomain'den restaurant bulma
  const getCurrentRestaurant = () => {
    if (typeof window === 'undefined') return null;
    if (!restaurants || !Array.isArray(restaurants)) return null;
    
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    const mainDomains = ['localhost', 'www', 'guzellestir'];
    
    if (mainDomains.includes(subdomain)) return null;
    return restaurants.find((r: { username: string }) => r.username === subdomain);
  };

  const currentRestaurant = getCurrentRestaurant();

  const isTurkish = currentLanguage === 'Turkish';
  
  const quickServices = [
    {
      id: 'water',
      icon: FaGlassWater,
      title: isTurkish ? 'Su İstiyorum' : 'Water Please',
      message: isTurkish ? 'Su getirebilir misiniz?' : 'Could you bring water?'
    },
    {
      id: 'clean',
      icon: FaBroom,
      title: isTurkish ? 'Masayı Temizler misiniz?' : 'Clean Table',
      message: isTurkish ? 'Masayı temizleyebilir misiniz?' : 'Could you clean the table?'
    },
    {
      id: 'bill',
      icon: FaReceipt,
      title: isTurkish ? 'Hesap Lütfen' : 'Bill Please',
      message: isTurkish ? 'Hesabı getirebilir misiniz?' : 'Could you bring the bill?'
    },
    {
      id: 'utensils',
      icon: FaUtensils,
      title: isTurkish ? 'Yeni Çatal Bıçak' : 'New Utensils',
      message: isTurkish ? 'Yeni çatal bıçak getirebilir misiniz?' : 'Could you bring new utensils?'
    }
  ] as const;

  const handleQuickService = async (service: typeof quickServices[number]) => {
    if (!currentRestaurant?.id || !tableNumber) {
      setToastMessage('Masa numarası bulunamadı');
      return;
    }

    setIsLoading(true);
    try {
      // Backend'e servis çağrısı gönder
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/service-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Subdomain': currentRestaurant.username || 'aksaray'
        },
        body: JSON.stringify({
          restaurantId: currentRestaurant.id,
          tableNumber: tableNumber,
          serviceType: service.id,
          message: service.message,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setToastMessage(`${service.title} çağrısı gönderildi!`);
        setTimeout(() => {
          setToastMessage('');
          onClose();
        }, 2000);
      } else {
        setToastMessage('Çağrı gönderilemedi, tekrar deneyin');
      }
    } catch (error) {
      console.error('Service call error:', error);
      setToastMessage('Bir hata oluştu, tekrar deneyin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomNote = async () => {
    if (!customNote.trim()) {
      setToastMessage('Lütfen bir mesaj yazın');
      return;
    }

    if (!currentRestaurant?.id || !tableNumber) {
      setToastMessage('Masa numarası bulunamadı');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/service-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Subdomain': currentRestaurant.username || 'aksaray'
        },
        body: JSON.stringify({
          restaurantId: currentRestaurant.id,
          tableNumber: tableNumber,
          serviceType: 'custom',
          message: customNote.trim(),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setToastMessage('Özel mesajınız gönderildi!');
        setCustomNote('');
        setTimeout(() => {
          setToastMessage('');
          onClose();
        }, 2000);
      } else {
        setToastMessage('Mesaj gönderilemedi, tekrar deneyin');
      }
    } catch (error) {
      console.error('Custom note error:', error);
      setToastMessage('Bir hata oluştu, tekrar deneyin');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-60 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl m-4">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 rounded-t-xl">
            <h3 className="text-xl font-semibold text-gray-800">
              <TranslatedText>Hızlı Servis</TranslatedText>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Masa Bilgisi */}
            {tableNumber && (
              <div className="text-center mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <TranslatedText>Masa</TranslatedText> #{tableNumber}
                </div>
              </div>
            )}

            {/* Hızlı Servis Butonları */}
            <div className="grid grid-cols-2 gap-3">
              {quickServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleQuickService(service)}
                    disabled={isLoading}
                    className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconComponent className="text-2xl text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-800 text-center">
                      {service.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Özel Not */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                <TranslatedText>Özel Not</TranslatedText>
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={isTurkish ? 'Özel isteğinizi yazın...' : 'Write your special request...'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={handleCustomNote}
                disabled={isLoading || !customNote.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaPaperPlane />
                <TranslatedText>Gönder</TranslatedText>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function QuickServiceModal({ isOpen, onClose }: QuickServiceModalProps) {
  return (
    <LanguageProvider>
      <QuickServiceModalContent isOpen={isOpen} onClose={onClose} />
    </LanguageProvider>
  );
}
