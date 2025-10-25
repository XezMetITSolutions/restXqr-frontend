'use client';

import { useState, useEffect } from 'react';
import { FaBug, FaUtensils, FaCashRegister, FaBell, FaPlay, FaCheckCircle, FaExclamationTriangle, FaRefresh } from 'react-icons/fa';

interface DebugResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

export default function DebugPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [orderData, setOrderData] = useState({
    tableNumber: 5,
    items: [
      { name: 'Test Pizza', quantity: 1, price: 25.50, notes: 'Debug siparişi' },
      { name: 'Test Salata', quantity: 2, price: 15.00, notes: 'Debug siparişi' }
    ]
  });
  const [restaurantMenu, setRestaurantMenu] = useState<any[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  const addResult = (step: string, success: boolean, message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(`🐛 DEBUG: ${step} - ${logMessage}`, data);
    setResults(prev => [...prev, { step, success, message: logMessage, data }]);
  };

  const addDetailedLog = (step: string, details: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${details}`;
    console.log(`📋 DETAIL: ${step} - ${logMessage}`, data);
    setResults(prev => [...prev, { step, success: true, message: logMessage, data }]);
  };

  const runDebugTest = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // 1. Sipariş Oluştur
      addResult('Sipariş Oluşturma', false, 'Başlatılıyor...');
      
      // API URL kontrolü
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      addDetailedLog('API URL Kontrolü', `API URL: ${apiUrl}`);
      
      const orderPayload = {
        restaurantId: 'aksaray', // Aksaray restaurant ID
        tableNumber: orderData.tableNumber,
        items: orderData.items.map(item => ({
          menuItemId: null, // Backend otomatik oluşturacak
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          price: item.price,
          notes: item.notes
        })),
        notes: 'Debug test siparişi - ' + new Date().toISOString(),
        orderType: 'dine_in'
      };

      addDetailedLog('Sipariş Payload', `Gönderilecek sipariş verisi hazırlandı`, orderPayload);
      
      const orderEndpoint = `${apiUrl}/orders`;
      addDetailedLog('API Endpoint', `Sipariş endpoint: ${orderEndpoint}`);
      
      addDetailedLog('HTTP İsteği', `POST ${orderEndpoint} - İstek gönderiliyor...`);
      
      const orderResponse = await fetch(orderEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      addDetailedLog('HTTP Yanıtı', `Status: ${orderResponse.status} ${orderResponse.statusText}`);
      addDetailedLog('Response Headers', `Headers: ${JSON.stringify(Object.fromEntries(orderResponse.headers.entries()))}`);

      const orderResult = await orderResponse.json();
      addDetailedLog('Response Body', `API'den dönen veri`, orderResult);
      
      if (orderResult.success) {
        addResult('Sipariş Oluşturma', true, `Sipariş başarıyla oluşturuldu! ID: ${orderResult.data.id}`, orderResult.data);
        
        // 2. Mutfak Paneline Bildirim Gönder
        addResult('Mutfak Bildirimi', false, 'Gönderiliyor...');
        
        const kitchenNotification = {
          type: 'new_order',
          data: {
            orderId: orderResult.data.id,
            restaurantId: 'aksaray',
            tableNumber: orderData.tableNumber,
            items: orderData.items,
            totalAmount: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString()
          }
        };

        addDetailedLog('Mutfak Bildirimi', `Bildirim verisi hazırlandı`, kitchenNotification);

        // Real-time bildirim gönder (SSE publish)
        try {
          const notificationEndpoint = `${apiUrl}/debug/publish-notification`;
          addDetailedLog('Bildirim Endpoint', `Bildirim endpoint: ${notificationEndpoint}`);
          
          const notificationPayload = {
            eventType: 'new_order',
            data: kitchenNotification.data
          };
          
          addDetailedLog('Bildirim Payload', `Gönderilecek bildirim verisi`, notificationPayload);
          addDetailedLog('HTTP İsteği', `POST ${notificationEndpoint} - Bildirim gönderiliyor...`);
          
          const notificationResponse = await fetch(notificationEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationPayload),
          });

          addDetailedLog('Bildirim Yanıtı', `Status: ${notificationResponse.status} ${notificationResponse.statusText}`);
          
          if (notificationResponse.ok) {
            const notificationResult = await notificationResponse.json();
            addDetailedLog('Bildirim Sonucu', `Bildirim başarılı`, notificationResult);
            addResult('Mutfak Bildirimi', true, 'Mutfak paneline bildirim gönderildi!', kitchenNotification);
          } else {
            const errorText = await notificationResponse.text();
            addDetailedLog('Bildirim Hatası', `Hata detayı`, errorText);
            addResult('Mutfak Bildirimi', false, 'Mutfak bildirimi gönderilemedi', errorText);
          }
        } catch (error: any) {
          addDetailedLog('Bildirim Exception', `Exception detayı`, error);
          addResult('Mutfak Bildirimi', false, `Mutfak bildirimi hatası: ${error.message}`);
        }

        // 3. Kasa Paneline Bildirim Gönder
        addResult('Kasa Bildirimi', false, 'Gönderiliyor...');
        
        const cashierNotification = {
          type: 'new_order',
          data: {
            orderId: orderResult.data.id,
            restaurantId: 'aksaray',
            tableNumber: orderData.tableNumber,
            items: orderData.items,
            totalAmount: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString(),
            paymentStatus: 'pending'
          }
        };

        addDetailedLog('Kasa Bildirimi', `Kasa bildirim verisi hazırlandı`, cashierNotification);

        try {
          const cashierEndpoint = `${apiUrl}/debug/publish-notification`;
          addDetailedLog('Kasa Endpoint', `Kasa endpoint: ${cashierEndpoint}`);
          
          const cashierPayload = {
            eventType: 'cashier_order',
            data: cashierNotification.data
          };
          
          addDetailedLog('Kasa Payload', `Gönderilecek kasa bildirim verisi`, cashierPayload);
          addDetailedLog('HTTP İsteği', `POST ${cashierEndpoint} - Kasa bildirimi gönderiliyor...`);
          
          const cashierResponse = await fetch(cashierEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cashierPayload),
          });

          addDetailedLog('Kasa Yanıtı', `Status: ${cashierResponse.status} ${cashierResponse.statusText}`);
          
          if (cashierResponse.ok) {
            const cashierResult = await cashierResponse.json();
            addDetailedLog('Kasa Sonucu', `Kasa bildirimi başarılı`, cashierResult);
            addResult('Kasa Bildirimi', true, 'Kasa paneline bildirim gönderildi!', cashierNotification);
          } else {
            const errorText = await cashierResponse.text();
            addDetailedLog('Kasa Hatası', `Kasa bildirimi hatası`, errorText);
            addResult('Kasa Bildirimi', false, 'Kasa bildirimi gönderilemedi', errorText);
          }
        } catch (error: any) {
          addDetailedLog('Kasa Exception', `Kasa bildirimi exception`, error);
          addResult('Kasa Bildirimi', false, `Kasa bildirimi hatası: ${error.message}`);
        }

      } else {
        addDetailedLog('Sipariş Hatası', `Sipariş oluşturulamadı - Detaylar`, orderResult);
        addResult('Sipariş Oluşturma', false, `Sipariş oluşturulamadı: ${orderResult.message}`, orderResult);
      }

    } catch (error: any) {
      addDetailedLog('Genel Exception', `Genel hata detayı`, error);
      addResult('Genel Hata', false, `Debug test hatası: ${error.message}`);
    } finally {
      addDetailedLog('Test Tamamlandı', `Debug testi tamamlandı`);
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  // Aksaray restoranının menüsünü çek
  const loadRestaurantMenu = async () => {
    setIsLoadingMenu(true);
    addDetailedLog('Menü Yükleme', 'Aksaray restoranının menüsü çekiliyor...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      const menuEndpoint = `${apiUrl}/restaurants/aksaray/menu`;
      
      addDetailedLog('Menü Endpoint', `Menü endpoint: ${menuEndpoint}`);
      
      const response = await fetch(menuEndpoint);
      addDetailedLog('Menü Yanıtı', `Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const menuData = await response.json();
        addDetailedLog('Menü Verisi', `Menü başarıyla çekildi`, menuData);
        
        if (menuData.success && menuData.data) {
          const allItems = menuData.data.categories?.flatMap((category: any) => 
            category.items?.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              description: item.description,
              category: category.name
            })) || []
          ) || [];
          
          setRestaurantMenu(allItems);
          addDetailedLog('Menü İşlendi', `${allItems.length} ürün bulundu`, allItems);
        }
      } else {
        const errorText = await response.text();
        addDetailedLog('Menü Hatası', `Menü çekilemedi`, errorText);
      }
    } catch (error: any) {
      addDetailedLog('Menü Exception', `Menü çekme hatası`, error);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // Sayfa yüklendiğinde menüyü çek
  useEffect(() => {
    loadRestaurantMenu();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold mb-4">
            <FaBug className="mr-2" />
            Debug Test Sayfası
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sipariş ve Bildirim Testi</h1>
          <p className="text-gray-300">Aksaray restoranı için sipariş oluşturup bildirimleri test edin</p>
        </div>

        {/* Test Configuration */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Konfigürasyonu</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Masa Numarası</label>
              <input
                type="number"
                value={orderData.tableNumber}
                onChange={(e) => setOrderData(prev => ({ ...prev, tableNumber: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Toplam Tutar</label>
              <div className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white">
                ₺{orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Sipariş Ürünleri</label>
              <button
                onClick={loadRestaurantMenu}
                disabled={isLoadingMenu}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors disabled:opacity-50"
              >
                <FaRefresh className={isLoadingMenu ? 'animate-spin' : ''} />
                <span>Menüyü Yenile</span>
              </button>
            </div>
            
            {/* Menüden Ürün Seçimi */}
            {restaurantMenu.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Menüden Ürün Ekle:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {restaurantMenu.slice(0, 10).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        const newItem = {
                          name: item.name,
                          quantity: 1,
                          price: item.price,
                          notes: `Gerçek ürün - ${item.category}`
                        };
                        setOrderData(prev => ({
                          ...prev,
                          items: [...prev.items, newItem]
                        }));
                      }}
                      className="text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-400 text-xs">₺{item.price} - {item.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-gray-400 text-sm">Adet: {item.quantity} × ₺{item.price}</div>
                    {item.notes && <div className="text-gray-500 text-xs">{item.notes}</div>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-white font-semibold">₺{(item.price * item.quantity).toFixed(2)}</div>
                    <button
                      onClick={() => {
                        setOrderData(prev => ({
                          ...prev,
                          items: prev.items.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={runDebugTest}
            disabled={isRunning}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Test Çalışıyor...</span>
              </>
            ) : (
              <>
                <FaPlay />
                <span>Debug Testi Başlat</span>
              </>
            )}
          </button>

          <button
            onClick={clearResults}
            disabled={isRunning}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <FaExclamationTriangle />
            <span>Sonuçları Temizle</span>
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Test Sonuçları</h2>
              <div className="text-sm text-gray-400">
                Toplam: {results.length} log
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.success 
                      ? 'bg-green-500/10 border-green-500' 
                      : 'bg-red-500/10 border-red-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {result.success ? (
                      <FaCheckCircle className="text-green-400 text-lg mt-0.5 flex-shrink-0" />
                    ) : (
                      <FaExclamationTriangle className="text-red-400 text-lg mt-0.5 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm">{result.step}</div>
                      <div className={`text-xs mt-1 ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                        {result.message}
                      </div>
                      
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-gray-400 text-xs cursor-pointer hover:text-gray-300">
                            📋 Detayları Göster ({typeof result.data === 'object' ? Object.keys(result.data).length : 1} öğe)
                          </summary>
                          <pre className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300 overflow-x-auto max-h-40">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Console Log Info */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-300 text-sm">
                <span>💡</span>
                <span>Detaylı loglar browser console'da da görüntüleniyor (F12 → Console)</span>
              </div>
            </div>
          </div>
        )}

        {/* Target Panels Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <FaUtensils className="text-orange-400 text-xl" />
              <h3 className="text-white font-semibold">Mutfak Paneli</h3>
            </div>
            <p className="text-gray-300 text-sm">
              <a 
                href="https://aksaray.restxqr.com/kitchen/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                https://aksaray.restxqr.com/kitchen/
              </a>
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Yeni siparişler burada görünecek
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <FaCashRegister className="text-green-400 text-xl" />
              <h3 className="text-white font-semibold">Kasa Paneli</h3>
            </div>
            <p className="text-gray-300 text-sm">
              <a 
                href="https://aksaray.restxqr.com/cashier/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                https://aksaray.restxqr.com/cashier/
              </a>
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Ödeme bekleyen siparişler burada görünecek
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}