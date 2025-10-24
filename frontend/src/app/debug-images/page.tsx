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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">🖼️ Image Debug Page</h1>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-2">API Configuration</h2>
          <div className="text-sm text-gray-700">
            <div>API URL: {API_URL}</div>
            <div>Restaurant: {restaurantData?.success ? restaurantData.data.name : 'Loading...'}</div>
            <div>Total Items: {restaurantData?.success ? 
              restaurantData.data.categories.reduce((total: number, cat: any) => total + cat.items.length, 0) : 
              'Loading...'
            }</div>
          </div>
        </div>

        {/* Product Image Management */}
        <div className="bg-white p-4 rounded border space-y-4">
          <h2 className="font-semibold text-red-600">🚨 Ürün Resim Yönetimi</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              <strong>Uyarı:</strong> Bu işlemler tüm ürün resimlerini etkileyecektir. 
              Önce tüm resimleri temizleyip sonra doğru resimleri atayın.
            </p>
          </div>

          {/* New Images Preview */}
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <h3 className="font-semibold text-green-800 mb-2">🖼️ Yeni Resimler Önizleme</h3>
            <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-3">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Önemli:</strong> Resimler Unsplash'ten otomatik olarak seçilmiştir. 
                Lütfen her resmi kontrol edin ve yanlış olanları manuel olarak düzeltin.
                Özellikle "Etli Pilav" için burger fotoğrafı kullanılmıştı - düzeltildi.
              </p>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Aşağıda atanacak yeni resimlerin önizlemesi görünüyor. 
              Her ürün için uygun resim seçilmiştir.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {Object.entries(productImageMap).map(([productName, imageUrl]) => (
                <div key={productName} className="bg-white rounded border p-2">
                  <img
                    src={imageUrl}
                    alt={productName}
                    className="w-full h-20 object-cover rounded mb-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <p className="text-xs text-gray-600 truncate" title={productName}>
                    {productName}
                  </p>
                  <button
                    onClick={() => {
                      const newUrl = prompt(`"${productName}" için yeni resim URL'si girin:`, imageUrl);
                      if (newUrl && newUrl !== imageUrl) {
                        productImageMap[productName] = newUrl;
                        alert('Resim URL\'si güncellendi! Sayfayı yenileyin.');
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    ✏️ Düzenle
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadRestaurantData}
              disabled={loading}
              className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {loading ? 'Yükleniyor...' : '🔄 Restoran Verilerini Yenile'}
            </button>
            
            <button
              onClick={clearAllProductImages}
              disabled={loading || !restaurantData?.success}
              className="bg-red-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {loading ? 'İşleniyor...' : '🗑️ Tüm Resimleri Temizle'}
            </button>
            
            <button
              onClick={updateAllProductImages}
              disabled={loading || !restaurantData?.success}
              className="bg-green-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {loading ? 'İşleniyor...' : '🖼️ Doğru Resimleri Ata'}
            </button>
          </div>

          {restaurantData?.success && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">📋 Mevcut Ürünler ve Resimleri:</h3>
              <div className="max-h-96 overflow-y-auto bg-gray-50 p-3 rounded text-sm">
                {restaurantData.data.categories.map((category: any) => (
                  <div key={category.id} className="mb-4">
                    <strong className="text-blue-600">{category.name}:</strong>
                    <div className="ml-4 space-y-2">
                      {category.items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500">({item.price}₺)</span>
                            <span className={item.imageUrl ? 'text-green-600' : 'text-red-600'}>
                              {item.imageUrl ? '✅ Resim Var' : '❌ Resim Yok'}
                            </span>
                          </div>
                          {item.imageUrl && (
                            <div className="flex items-center space-x-2">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded border"
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
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                🔍 Büyük Görüntüle
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded border space-y-4">
          <h2 className="font-semibold">Resim Seç ve Test Et</h2>
          
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <div>Dosya Adı: {selectedFile.name}</div>
                <div>Boyut: {(selectedFile.size / 1024).toFixed(2)} KB</div>
                <div>Tip: {selectedFile.type}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={uploadImage}
                  disabled={loading}
                  className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
                >
                  {loading ? 'Yükleniyor...' : 'Resim Yükle (POST /upload/image)'}
                </button>
                
                <button
                  onClick={testImageEndpoint}
                  disabled={loading}
                  className="bg-green-600 text-white rounded px-4 py-2 disabled:opacity-50"
                >
                  {loading ? 'Test Ediliyor...' : 'Test Endpoint (POST /test-image)'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Clear Results */}
          {clearResults && (
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2 text-red-600">🗑️ Temizleme Sonuçları</h3>
              <div className="text-sm">
                <div className="mb-2">
                  <span className={clearResults.success ? 'text-green-600' : 'text-red-600'}>
                    {clearResults.success ? '✅ Başarılı' : '❌ Hatalı'}
                  </span>
                  {clearResults.totalItems && (
                    <span className="ml-2">({clearResults.totalItems} ürün)</span>
                  )}
                </div>
                {clearResults.error && (
                  <div className="text-red-600 bg-red-50 p-2 rounded">
                    {clearResults.error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Update Results */}
          {updateResults.length > 0 && (
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2 text-green-600">🖼️ Güncelleme Sonuçları</h3>
              <div className="max-h-60 overflow-y-auto text-sm">
                {updateResults.map((result, index) => (
                  <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{result.itemName}</span>
                      <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                        {result.success ? '✅' : '❌'}
                      </span>
                    </div>
                    {result.error && (
                      <div className="text-red-600 text-xs mt-1">{result.error}</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Toplam: {updateResults.length} | 
                Başarılı: {updateResults.filter(r => r.success).length} | 
                Hatalı: {updateResults.filter(r => !r.success).length}
              </div>
            </div>
          )}

          {/* Upload Result */}
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Upload Result</h3>
            {uploadResult && (
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            )}
          </div>

          {/* Test Endpoint Result */}
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Test Endpoint Result</h3>
            {testResult && (
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {uploadResult?.success && uploadResult?.data?.imageUrl && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Yüklenen Resim Önizleme</h3>
            <div className="max-w-md">
              <img
                src={uploadResult.data.imageUrl}
                alt="Uploaded image"
                className="max-w-full h-auto rounded border"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
