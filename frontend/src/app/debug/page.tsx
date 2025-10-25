'use client';

import { useState } from 'react';
import { FaBug, FaUtensils, FaCashRegister, FaBell, FaPlay, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

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

  const addResult = (step: string, success: boolean, message: string, data?: any) => {
    setResults(prev => [...prev, { step, success, message, data }]);
  };

  const runDebugTest = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // 1. Sipariş Oluştur
      addResult('Sipariş Oluşturma', false, 'Başlatılıyor...');
      
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

      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com'}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const orderResult = await orderResponse.json();
      
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

        // Real-time bildirim gönder (SSE publish)
        try {
          const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com'}/debug/publish-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventType: 'new_order',
              data: kitchenNotification.data
            }),
          });

          if (notificationResponse.ok) {
            addResult('Mutfak Bildirimi', true, 'Mutfak paneline bildirim gönderildi!', kitchenNotification);
          } else {
            addResult('Mutfak Bildirimi', false, 'Mutfak bildirimi gönderilemedi', await notificationResponse.text());
          }
        } catch (error) {
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

        try {
          const cashierResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com'}/debug/publish-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventType: 'cashier_order',
              data: cashierNotification.data
            }),
          });

          if (cashierResponse.ok) {
            addResult('Kasa Bildirimi', true, 'Kasa paneline bildirim gönderildi!', cashierNotification);
          } else {
            addResult('Kasa Bildirimi', false, 'Kasa bildirimi gönderilemedi', await cashierResponse.text());
          }
        } catch (error) {
          addResult('Kasa Bildirimi', false, `Kasa bildirimi hatası: ${error.message}`);
        }

      } else {
        addResult('Sipariş Oluşturma', false, `Sipariş oluşturulamadı: ${orderResult.message}`, orderResult);
      }

    } catch (error: any) {
      addResult('Genel Hata', false, `Debug test hatası: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

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
            <label className="block text-sm font-medium text-gray-300 mb-2">Sipariş Ürünleri</label>
            <div className="space-y-2">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-gray-400 text-sm">Adet: {item.quantity} × ₺{item.price}</div>
                  </div>
                  <div className="text-white font-semibold">₺{(item.price * item.quantity).toFixed(2)}</div>
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
            <h2 className="text-xl font-semibold text-white mb-4">Test Sonuçları</h2>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.success 
                      ? 'bg-green-500/10 border-green-500' 
                      : 'bg-red-500/10 border-red-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <FaCheckCircle className="text-green-400 text-xl" />
                    ) : (
                      <FaExclamationTriangle className="text-red-400 text-xl" />
                    )}
                    
                    <div className="flex-1">
                      <div className="text-white font-medium">{result.step}</div>
                      <div className={`text-sm ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                        {result.message}
                      </div>
                      
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300">
                            Detayları Göster
                          </summary>
                          <pre className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300 overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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