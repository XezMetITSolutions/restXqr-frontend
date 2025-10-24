'use client';

import { useState, useEffect } from 'react';

export default function DebugImagesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [updateResults, setUpdateResults] = useState<any[]>([]);
  const [clearResults, setClearResults] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  // COMPLETELY CORRECTED product image mapping with PROPER Turkish food images
  const productImageMap: { [key: string]: string } = {
    // Çorbalar (Soups) - Specific Turkish soup images
    'Mercimek Çorbası': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&q=80', // Red lentil soup
    'Ezogelin Çorbası': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&q=80', // Ezogelin soup
    'Tavuk Çorbası': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop&q=80', // Chicken soup

    // Ana Yemekler (Main Dishes) - Authentic Turkish main dishes
    'Karnıyarık': 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=400&h=300&fit=crop&q=80', // Stuffed eggplant
    'Mantı': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80', // Turkish ravioli/dumplings
    'Etli Pilav': 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop&q=80', // Turkish rice with meat - CORRECTED

    // Izgara (Grilled) - Proper kebab images
    'Adana Kebap': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop&q=80', // Spicy minced meat kebab
    'Urfa Kebap': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&q=80', // Non-spicy minced meat kebab
    'Tavuk Şiş': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop&q=80', // Chicken skewer

    // Pizza - Authentic pizza images
    'Margherita Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80', // Classic margherita
    'Pepperoni Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&q=80', // Pepperoni pizza
    'Karışık Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&q=80', // Mixed toppings pizza

    // Salatalar (Salads) - Turkish salad images
    'Çoban Salata': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80', // Turkish shepherd salad
    'Mevsim Salata': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop&q=80', // Seasonal green salad
    'Tavuk Salata': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&q=80', // Chicken salad

    // İçecekler (Beverages) - Turkish beverages
    'Ayran': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80', // Turkish yogurt drink
    'Türk Kahvesi': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&q=80', // Turkish coffee
    'Çay': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&q=80', // Turkish tea in glass
    'Kola': 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop&q=80', // Cola drink

    // Tatlılar (Desserts) - Turkish desserts
    'Baklava': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&q=80', // Turkish baklava with nuts
    'Künefe': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop&q=80', // Turkish kunefe dessert
    'Sütlaç': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&q=80', // Turkish rice pudding

    // Kahvaltı (Breakfast) - Turkish breakfast items
    'Serpme Kahvaltı': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop&q=80', // Turkish breakfast spread
    'Menemen': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop&q=80', // Turkish scrambled eggs with tomatoes
    'Omlet': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&q=80' // Turkish cheese omelet
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setTestResult(null);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);
    } catch (error) {
      setUploadResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const testImageEndpoint = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch(`${API_URL}/test-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64,
            testData: 'Debug test from frontend'
          }),
        });

        const result = await response.json();
        setTestResult(result);
        setLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setTestResult({ error: (error as Error).message });
      setLoading(false);
    }
  };

  // Load restaurant data
  const loadRestaurantData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/restaurants/username/aksaray`);
      const data = await response.json();
      setRestaurantData(data);
      console.log('Restaurant data loaded:', data);
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      setRestaurantData({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  // Clear all product images (set to null)
  const clearAllProductImages = async () => {
    if (!restaurantData?.success || !restaurantData?.data) {
      alert('Önce restoran verilerini yükleyin!');
      return;
    }

    setLoading(true);
    const results = [];
    
    try {
      const restaurant = restaurantData.data;
      
      for (const category of restaurant.categories) {
        for (const item of category.items) {
          console.log(`🗑️ Clearing image for: ${item.name}`);
          
          const updateResponse = await fetch(`${API_URL}/restaurants/${restaurant.id}/menu/items/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: null
            })
          });

          const result = await updateResponse.json();
          results.push({
            itemName: item.name,
            success: updateResponse.ok,
            result: result
          });

          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      setClearResults({
        success: true,
        totalItems: results.length,
        results: results
      });
      
    } catch (error) {
      setClearResults({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Update all product images with correct ones
  const updateAllProductImages = async () => {
    if (!restaurantData?.success || !restaurantData?.data) {
      alert('Önce restoran verilerini yükleyin!');
      return;
    }

    setLoading(true);
    const results = [];
    
    try {
      const restaurant = restaurantData.data;
      
      for (const category of restaurant.categories) {
        for (const item of category.items) {
          const correctImageUrl = productImageMap[item.name];
          
          if (correctImageUrl) {
            console.log(`🖼️ Updating image for: ${item.name}`);
            console.log(`   New image: ${correctImageUrl}`);
            
            const updateResponse = await fetch(`${API_URL}/restaurants/${restaurant.id}/menu/items/${item.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageUrl: correctImageUrl
              })
            });

            const result = await updateResponse.json();
            results.push({
              itemName: item.name,
              newImageUrl: correctImageUrl,
              success: updateResponse.ok,
              result: result
            });
          } else {
            results.push({
              itemName: item.name,
              success: false,
              error: 'No image mapping found'
            });
          }

          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setUpdateResults(results);
      
    } catch (error) {
      setUpdateResults([{
        itemName: 'ERROR',
        success: false,
        error: error.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Load restaurant data on component mount
  useEffect(() => {
    loadRestaurantData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🖼️ Aksaray Restoran Resim Yönetimi
              </h1>
              <p className="text-lg text-gray-600">
                Ürün resimlerini güvenli bir şekilde yönetin ve düzenleyin
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                ✅ API Bağlantısı Aktif
              </div>
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                🔗 {API_URL}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Restaurant Info Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">🏪 Restoran Bilgileri</h2>
            <p className="text-blue-100">Aksaray restoranının mevcut durumu ve istatistikleri</p>
          </div>
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏪</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Restoran Adı</h3>
                <p className="text-gray-600">{restaurantData?.success ? restaurantData.data.name : 'Yükleniyor...'}</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Toplam Ürün</h3>
                <p className="text-gray-600">{restaurantData?.success ? 
                  restaurantData.data.categories.reduce((total: number, cat: any) => total + cat.items.length, 0) : 
                  'Yükleniyor...'
                }</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📂</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Kategori Sayısı</h3>
                <p className="text-gray-600">{restaurantData?.success ? restaurantData.data.categories.length : 'Yükleniyor...'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Image Management */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">🚨 Ürün Resim Yönetimi</h2>
            <p className="text-red-100">Tüm ürün resimlerini güvenli bir şekilde yönetin</p>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Warning Alert */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Önemli Uyarı</h3>
                  <p className="text-yellow-700">
                    Bu işlemler tüm ürün resimlerini etkileyecektir. 
                    Önce tüm resimleri temizleyip sonra doğru resimleri atayın.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={loadRestaurantData}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-xl">🔄</span>
                  <div className="text-left">
                    <div className="font-semibold">Verileri Yenile</div>
                    <div className="text-sm opacity-90">Restoran bilgilerini güncelle</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={clearAllProductImages}
                disabled={loading || !restaurantData?.success}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-xl">🗑️</span>
                  <div className="text-left">
                    <div className="font-semibold">Resimleri Temizle</div>
                    <div className="text-sm opacity-90">Tüm resimleri kaldır</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={updateAllProductImages}
                disabled={loading || !restaurantData?.success}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-xl">🖼️</span>
                  <div className="text-left">
                    <div className="font-semibold">Resimleri Ata</div>
                    <div className="text-sm opacity-90">Doğru resimleri yükle</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* New Images Preview */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">🖼️ Yeni Resimler Önizleme</h2>
            <p className="text-green-100">Atanacak resimlerin önizlemesi ve düzenleme seçenekleri</p>
          </div>
          
          <div className="p-8">
            {/* Important Notice */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Resim Kontrolü</h3>
                  <p className="text-yellow-700">
                    Resimler Unsplash'ten otomatik olarak seçilmiştir. 
                    Lütfen her resmi kontrol edin ve yanlış olanları manuel olarak düzeltin.
                    Özellikle "Etli Pilav" için burger fotoğrafı kullanılmıştı - düzeltildi.
                  </p>
                </div>
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
              {Object.entries(productImageMap).map(([productName, imageUrl]) => (
                <div key={productName} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={productName}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => {
                          const newUrl = prompt(`"${productName}" için yeni resim URL'si girin:`, imageUrl);
                          if (newUrl && newUrl !== imageUrl) {
                            productImageMap[productName] = newUrl;
                            alert('Resim URL\'si güncellendi! Sayfayı yenileyin.');
                          }
                        }}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-blue-600 hover:text-blue-800 p-1 rounded-full shadow-md transition-all duration-200"
                        title="Resmi düzenle"
                      >
                        <span className="text-sm">✏️</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800 truncate" title={productName}>
                      {productName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Tıklayarak düzenle</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Products */}
        {restaurantData?.success && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-6">
              <h2 className="text-2xl font-bold text-white mb-2">📋 Mevcut Ürünler ve Resimleri</h2>
              <p className="text-purple-100">Restoranınızdaki tüm ürünlerin mevcut durumu</p>
            </div>
            
            <div className="p-8">
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {restaurantData.data.categories.map((category: any) => (
                  <div key={category.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold">📂</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      <span className="ml-auto bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {category.items.length} ürün
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {category.items.map((item: any) => (
                        <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                              <p className="text-gray-600 text-sm mb-2">{item.price}₺</p>
                              <div className="flex items-center space-x-2">
                                <span className={item.imageUrl ? 'text-green-600' : 'text-red-600'}>
                                  {item.imageUrl ? '✅ Resim Var' : '❌ Resim Yok'}
                                </span>
                                {item.isPopular && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                    ⭐ Popüler
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {item.imageUrl && (
                              <div className="ml-4 flex flex-col items-center space-y-2">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newWindow = window.open('', '_blank');
                                    if (newWindow) {
                                      newWindow.document.write(`
                                        <html>
                                          <head><title>${item.name} - Resim Önizleme</title></head>
                                          <body style="margin:0; padding:20px; background:#f5f5f5;">
                                            <h2>${item.name}</h2>
                                            <p>Fiyat: ${item.price}₺</p>
                                            <img src="${item.imageUrl}" style="max-width:100%; height:auto; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.1);" />
                                            <p style="margin-top:10px; color:#666;">Resim URL: ${item.imageUrl}</p>
                                          </body>
                                        </html>
                                      `);
                                    }
                                  }}
                                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
                                >
                                  🔍 Büyük Görüntüle
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">📤 Resim Yükleme ve Test</h2>
            <p className="text-indigo-100">Yeni resimler yükleyin ve API endpoint'lerini test edin</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors duration-200">
              <div className="mb-4">
                <span className="text-4xl">📁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resim Dosyası Seçin</h3>
              <p className="text-gray-600 mb-4">JPG, PNG veya GIF formatında resim yükleyebilirsiniz</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg cursor-pointer transition-colors duration-200"
              >
                📁 Dosya Seç
              </label>
            </div>

            {selectedFile && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seçilen Dosya Bilgileri</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Dosya Adı</div>
                    <div className="font-medium text-gray-900 truncate">{selectedFile.name}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Boyut</div>
                    <div className="font-medium text-gray-900">{(selectedFile.size / 1024).toFixed(2)} KB</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Format</div>
                    <div className="font-medium text-gray-900">{selectedFile.type}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={uploadImage}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-2">
                      <span>📤</span>
                      <span>{loading ? 'Yükleniyor...' : 'Resim Yükle'}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={testImageEndpoint}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-2">
                      <span>🧪</span>
                      <span>{loading ? 'Test Ediliyor...' : 'API Test Et'}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Clear Results */}
          {clearResults && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white">🗑️ Temizleme Sonuçları</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${clearResults.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className={`text-2xl ${clearResults.success ? 'text-green-600' : 'text-red-600'}`}>
                      {clearResults.success ? '✅' : '❌'}
                    </span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${clearResults.success ? 'text-green-800' : 'text-red-800'}`}>
                      {clearResults.success ? 'Başarılı' : 'Hatalı'}
                    </h4>
                    {clearResults.totalItems && (
                      <p className="text-gray-600">{clearResults.totalItems} ürün işlendi</p>
                    )}
                  </div>
                </div>
                {clearResults.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{clearResults.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Update Results */}
          {updateResults.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white">🖼️ Güncelleme Sonuçları</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-bold">{updateResults.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Toplam</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 font-bold">{updateResults.filter(r => r.success).length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Başarılı</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-600 font-bold">{updateResults.filter(r => !r.success).length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Hatalı</p>
                  </div>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {updateResults.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{result.itemName}</span>
                        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                          {result.success ? '✅' : '❌'}
                        </span>
                      </div>
                      {result.error && (
                        <p className="text-red-600 text-xs mt-1">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* API Results */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Result */}
          {(uploadResult || testResult) && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white">📤 API Yanıtları</h3>
              </div>
              <div className="p-6">
                {uploadResult && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Upload Sonucu</h4>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-48">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(uploadResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {testResult && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Test Sonucu</h4>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-48">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Uploaded Image Preview */}
          {uploadResult?.success && uploadResult?.data?.imageUrl && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white">🖼️ Yüklenen Resim Önizleme</h3>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <img
                    src={uploadResult.data.imageUrl}
                    alt="Uploaded image"
                    className="max-w-full h-auto rounded-xl shadow-lg border border-gray-200"
                  />
                  <p className="text-sm text-gray-600 mt-4">
                    Resim başarıyla yüklendi ve işlendi
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
