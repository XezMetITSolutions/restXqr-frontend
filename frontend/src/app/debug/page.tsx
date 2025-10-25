'use client';

import { useState, useEffect } from 'react';
import { FaBug, FaPlay, FaCheckCircle, FaExclamationTriangle, FaSync, FaList, FaShoppingCart } from 'react-icons/fa';

interface DebugResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export default function DebugPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [restaurantMenu, setRestaurantMenu] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const [tableNumber, setTableNumber] = useState(5);

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

  // Menüyü yükle
  const loadMenu = async () => {
    setIsLoadingMenu(true);
    addDetailedLog('Menü Yükleme', 'Aksaray restoranının menüsü çekiliyor...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      addDetailedLog('API URL', `API URL: ${apiUrl}`);
      
      // Restoranları çek
      const restaurantResponse = await fetch(`${apiUrl}/restaurants`);
      addDetailedLog('Restoran Yanıtı', `Status: ${restaurantResponse.status}`);
      
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json();
        addDetailedLog('Restoran Verisi', `Restoranlar çekildi`, restaurantData);
        
        // Aksaray restoranını bul
        const aksarayRestaurant = restaurantData.data?.find((r: any) => r.username === 'aksaray');
        addDetailedLog('Aksaray Restoran', `Aksaray restoran bulundu`, aksarayRestaurant);
        
        if (aksarayRestaurant) {
          // Menüyü çek
          const menuResponse = await fetch(`${apiUrl}/restaurants/${aksarayRestaurant.id}/menu`);
          addDetailedLog('Menü Yanıtı', `Status: ${menuResponse.status}`);
          
          if (menuResponse.ok) {
            const menuData = await menuResponse.json();
            addDetailedLog('Menü Verisi', `Menü başarıyla çekildi`, menuData);
            
            if (menuData.success && menuData.data) {
              const allItems = menuData.data.categories?.flatMap((category: any) => 
                category.items?.map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  description: item.description || '',
                  category: category.name
                })) || []
              ) || [];
              
              setRestaurantMenu(allItems);
              addDetailedLog('Menü İşlendi', `${allItems.length} ürün bulundu`, allItems);
            }
          } else {
            const errorText = await menuResponse.text();
            addDetailedLog('Menü Hatası', `Menü çekilemedi`, errorText);
          }
        } else {
          addDetailedLog('Restoran Bulunamadı', `Aksaray restoran bulunamadı`);
        }
      } else {
        const errorText = await restaurantResponse.text();
        addDetailedLog('Restoran Hatası', `Restoranlar çekilemedi`, errorText);
      }
    } catch (error: any) {
      addDetailedLog('Menü Exception', `Menü çekme hatası`, error);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // API çalışıyor mu test et
  const testAPI = async () => {
    addDetailedLog('API Test', 'API bağlantısı test ediliyor...');
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://masapp-backend.onrender.com';
      const healthResponse = await fetch(`${baseUrl}/health`);
      addDetailedLog('Health Check', `Status: ${healthResponse.status}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        addDetailedLog('Health Data', `API çalışıyor`, healthData);
        addResult('API Test', true, 'API bağlantısı başarılı!');
      } else {
        addDetailedLog('Health Hatası', `API çalışmıyor`, await healthResponse.text());
        addResult('API Test', false, 'API bağlantısı başarısız!');
      }
    } catch (error: any) {
      addDetailedLog('API Exception', `API test hatası`, error);
      addResult('API Test', false, `API test hatası: ${error.message}`);
    }
  };

  // Test siparişi oluştur (hızlı test için)
  const createTestOrder = async () => {
    setIsRunning(true);
    addDetailedLog('Test Siparişi', 'Hızlı test siparişi oluşturuluyor...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // Test ürünleri (gerçek menüden ilk 2 ürünü al)
      const testItems = restaurantMenu.slice(0, 2);
      
      if (testItems.length === 0) {
        addResult('Test Siparişi', false, 'Menü yüklenmedi, önce menüyü yükleyin!');
        setIsRunning(false);
        return;
      }
      
      const orderPayload = {
        restaurantId: 'aksaray',
        tableNumber: 99, // Test masası
        items: testItems.map(item => ({
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: item.price,
          price: item.price,
          notes: `Test siparişi - ${item.category}`
        })),
        notes: `Hızlı test siparişi - ${new Date().toLocaleTimeString()}`,
        orderType: 'dine_in'
      };

      addDetailedLog('Test Sipariş Payload', `Test sipariş verisi`, orderPayload);
      
      const orderResponse = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      addDetailedLog('Test Sipariş Yanıtı', `Status: ${orderResponse.status} ${orderResponse.statusText}`);
      
      const orderResult = await orderResponse.json();
      addDetailedLog('Test Sipariş Sonucu', `API'den dönen veri`, orderResult);
      
      if (orderResult.success) {
        addResult('Test Siparişi', true, `Test siparişi başarıyla oluşturuldu! ID: ${orderResult.data.id}`, orderResult.data);
        
        // Mutfak paneline bildirim gönder
        addDetailedLog('Test Mutfak Bildirimi', 'Mutfak paneline test bildirimi gönderiliyor...');
        
        try {
          const notificationPayload = {
            eventType: 'new_order',
            data: {
              orderId: orderResult.data.id,
              restaurantId: 'aksaray',
              tableNumber: 99,
              items: testItems.map(item => ({
                name: item.name,
                quantity: 1,
                notes: `Test siparişi - ${item.category}`
              })),
              totalAmount: testItems.reduce((sum, item) => sum + item.price, 0),
              timestamp: new Date().toISOString()
            }
          };
          
          addDetailedLog('Bildirim Payload', `Gönderilecek bildirim verisi`, notificationPayload);
          
          const notificationResponse = await fetch(`${apiUrl}/debug/publish-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationPayload),
          });

          addDetailedLog('Test Bildirim Yanıtı', `Status: ${notificationResponse.status}`);
          
          const notificationResult = await notificationResponse.json();
          addDetailedLog('Test Bildirim Sonucu', `API'den dönen veri`, notificationResult);
          
          if (notificationResponse.ok) {
            addResult('Test Mutfak Bildirimi', true, 'Mutfak paneline test bildirimi gönderildi!', notificationResult);
          } else {
            addResult('Test Mutfak Bildirimi', false, `Test bildirimi gönderilemedi: ${notificationResult.message}`, notificationResult);
          }
        } catch (error: any) {
          addDetailedLog('Test Bildirim Exception', `Test bildirim hatası`, error);
          addResult('Test Mutfak Bildirimi', false, `Test bildirim hatası: ${error.message}`);
        }
        
      } else {
        addResult('Test Siparişi', false, `Test siparişi oluşturulamadı: ${orderResult.message}`, orderResult);
      }

    } catch (error: any) {
      addDetailedLog('Test Sipariş Exception', `Test sipariş hatası`, error);
      addResult('Test Siparişi', false, `Test sipariş hatası: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Sipariş oluştur
  const createOrder = async () => {
    if (selectedItems.length === 0) {
      addResult('Sipariş Oluşturma', false, 'Lütfen en az 1 ürün seçin!');
      return;
    }

    setIsRunning(true);
    addDetailedLog('Sipariş Oluşturma', 'Sipariş oluşturuluyor...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      const orderPayload = {
        restaurantId: 'aksaray',
        tableNumber: tableNumber,
        items: selectedItems.map(item => ({
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: item.price,
          price: item.price,
          notes: `Debug siparişi - ${item.category}`
        })),
        notes: `Debug test siparişi - ${new Date().toLocaleTimeString()}`,
        orderType: 'dine_in'
      };

      addDetailedLog('Sipariş Payload', `Gönderilecek sipariş verisi`, orderPayload);
      
      const orderResponse = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      addDetailedLog('Sipariş Yanıtı', `Status: ${orderResponse.status} ${orderResponse.statusText}`);
      
      const orderResult = await orderResponse.json();
      addDetailedLog('Sipariş Sonucu', `API'den dönen veri`, orderResult);
      
      if (orderResult.success) {
        addResult('Sipariş Oluşturma', true, `Sipariş başarıyla oluşturuldu! ID: ${orderResult.data.id}`, orderResult.data);
        
        // Mutfak paneline bildirim gönder
        addDetailedLog('Mutfak Bildirimi', 'Mutfak paneline bildirim gönderiliyor...');
        
        try {
          const notificationPayload = {
            eventType: 'new_order',
            data: {
              orderId: orderResult.data.id,
              restaurantId: 'aksaray',
              tableNumber: tableNumber,
              items: selectedItems.map(item => ({
                name: item.name,
                quantity: 1,
                notes: `Debug siparişi - ${item.category}`
              })),
              totalAmount: selectedItems.reduce((sum, item) => sum + item.price, 0),
              timestamp: new Date().toISOString()
            }
          };
          
          const notificationResponse = await fetch(`${apiUrl}/debug/publish-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationPayload),
          });

          addDetailedLog('Bildirim Yanıtı', `Status: ${notificationResponse.status}`);
          
          if (notificationResponse.ok) {
            addResult('Mutfak Bildirimi', true, 'Mutfak paneline bildirim gönderildi!');
          } else {
            addResult('Mutfak Bildirimi', false, 'Mutfak bildirimi gönderilemedi');
          }
        } catch (error: any) {
          addDetailedLog('Bildirim Exception', `Bildirim hatası`, error);
          addResult('Mutfak Bildirimi', false, `Bildirim hatası: ${error.message}`);
        }
        
      } else {
        addResult('Sipariş Oluşturma', false, `Sipariş oluşturulamadı: ${orderResult.message}`, orderResult);
      }

    } catch (error: any) {
      addDetailedLog('Sipariş Exception', `Sipariş hatası`, error);
      addResult('Sipariş Oluşturma', false, `Sipariş hatası: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Sayfa yüklendiğinde menüyü çek
  useEffect(() => {
    const initializeMenu = async () => {
      await loadMenu();
    };
    initializeMenu();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold mb-4">
            <FaBug className="mr-2" />
            Debug Test Sayfası
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sipariş ve API Test Paneli</h1>
          <p className="text-gray-300">Aksaray restoranı için API testleri ve sipariş oluşturma</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Panel - Menü ve Seçim */}
          <div className="space-y-6">
            {/* API Test */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FaSync className="mr-2" />
                API Test
              </h2>
              <div className="space-y-3">
                <button
                  onClick={testAPI}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  API Çalışıyor Mu?
                </button>
                <button
                  onClick={createTestOrder}
                  disabled={isRunning || restaurantMenu.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isRunning ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Test Siparişi Oluşturuluyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FaPlay className="mr-2" />
                      <span>Test Siparişi Oluştur</span>
                    </div>
                  )}
                </button>
                {restaurantMenu.length === 0 && (
                  <p className="text-yellow-400 text-sm text-center">
                    ⚠️ Önce menüyü yükleyin
                  </p>
                )}
              </div>
            </div>

            {/* Menü Yükleme */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FaList className="mr-2" />
                Menü Yönetimi
              </h2>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-300">
                  {isLoadingMenu ? (
                    <span className="text-blue-400">Menü yükleniyor...</span>
                  ) : restaurantMenu.length > 0 ? (
                    <span className="text-green-400">{restaurantMenu.length} ürün yüklendi</span>
                  ) : (
                    <span className="text-yellow-400">Menü yüklenemedi</span>
                  )}
                </div>
                <button
                  onClick={loadMenu}
                  disabled={isLoadingMenu}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                >
                  <FaSync className={isLoadingMenu ? 'animate-spin' : ''} />
                  <span>Yenile</span>
                </button>
              </div>

              {/* Menü Listesi */}
              {restaurantMenu.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {restaurantMenu.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedItems.some(selected => selected.id === item.id)
                          ? 'bg-green-500/20 border-green-500'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => {
                        if (selectedItems.some(selected => selected.id === item.id)) {
                          setSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
                        } else if (selectedItems.length < 2) {
                          setSelectedItems(prev => [...prev, item]);
                        }
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-gray-400 text-sm">{item.category}</div>
                        </div>
                        <div className="text-white font-semibold">₺{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seçilen Ürünler */}
            {selectedItems.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <FaShoppingCart className="mr-2" />
                  Seçilen Ürünler ({selectedItems.length}/2)
                </h2>
                
                <div className="space-y-2 mb-4">
                  {selectedItems.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <div>
                        <div className="text-white font-medium">{item.name}</div>
                        <div className="text-gray-400 text-sm">{item.category}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-white font-semibold">₺{item.price}</div>
                        <button
                          onClick={() => setSelectedItems(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Masa Numarası</label>
                  <input
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="50"
                  />
                </div>

                <div className="text-right mb-4">
                  <div className="text-white font-semibold">
                    Toplam: ₺{selectedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={createOrder}
                  disabled={isRunning}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isRunning ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Sipariş Oluşturuluyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FaPlay className="mr-2" />
                      <span>Sipariş Oluştur</span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sağ Panel - Sonuçlar */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Test Sonuçları</h2>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-400">
                  {results.length} log
                </div>
                <button
                  onClick={clearResults}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                >
                  Temizle
                </button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Henüz test yapılmadı. Sol panelden testleri başlatın.
                </div>
              ) : (
                results.map((result, index) => (
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
                              📋 Detayları Göster
                            </summary>
                            <pre className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300 overflow-x-auto max-h-32">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Console Log Info */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-300 text-sm">
                <span>💡</span>
                <span>Detaylı loglar browser console'da da görüntüleniyor (F12 → Console)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Target Panels Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <FaSync className="text-orange-400 text-xl" />
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
              <FaShoppingCart className="text-green-400 text-xl" />
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