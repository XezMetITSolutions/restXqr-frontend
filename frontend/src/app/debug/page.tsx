'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testUploadEndpoint = async () => {
    try {
      addLog('🔍 Upload endpoint testi başlatılıyor...');
      
      const API_URL = 'https://masapp-backend.onrender.com/api';
      addLog(`🌐 API URL: ${API_URL}`);
      
      const uploadUrl = `${API_URL}/upload/image`;
      addLog(`🔗 Upload URL: ${uploadUrl}`);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true })
      });
      
      addLog(`📊 Response status: ${response.status}`);
      addLog(`📊 Response ok: ${response.ok}`);
      
      const result = await response.json();
      addLog(`📊 Response data: ${JSON.stringify(result)}`);
      
    } catch (error) {
      addLog(`❌ Test hatası: ${error}`);
    }
  };

  const testFileUpload = async () => {
    if (!selectedFile) {
      addLog('❌ Önce dosya seçin');
      return;
    }

    try {
      addLog(`📁 Dosya seçildi: ${selectedFile.name} (${selectedFile.size} bytes)`);
      
      const API_URL = 'https://masapp-backend.onrender.com/api';
      addLog(`🌐 API URL: ${API_URL}`);
      
      const uploadUrl = `${API_URL}/upload/image`;
      addLog(`🔗 Upload URL: ${uploadUrl}`);
      
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      addLog('📤 Backend\'e gönderiliyor...');
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      
      addLog(`📊 Response status: ${response.status}`);
      addLog(`📊 Response ok: ${response.ok}`);
      
      const result = await response.json();
      addLog(`📊 Response data: ${JSON.stringify(result)}`);
      
      if (result.success) {
        addLog(`✅ Resim yüklendi! URL: ${result.data.imageUrl}`);
        
        // Resmi test et
        const img = document.createElement('img');
        img.onload = () => {
          addLog(`✅ Resim görüntüleme testi başarılı (${img.width}x${img.height})`);
        };
        img.onerror = () => {
          addLog(`❌ Resim görüntüleme testi başarısız`);
        };
        const API_URL = 'https://masapp-backend.onrender.com/api';
        // imageUrl zaten /uploads ile başlıyorsa API_URL'i base olarak kullan
        const imageUrl = result.data.imageUrl.startsWith('/') ? `${API_URL.replace('/api', '')}${result.data.imageUrl}` : `${API_URL}${result.data.imageUrl}`;
        img.src = imageUrl;
        
      } else {
        addLog(`❌ Upload başarısız: ${result.message}`);
      }
      
    } catch (error) {
      addLog(`❌ Upload hatası: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Resim Yükleme Debug</h1>
        
        {/* API Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📡 API Bilgileri</h2>
          <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        </div>

        {/* Dosya Seçimi */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📁 Dosya Seçimi</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="mb-4"
          />
          {selectedFile && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p><strong>Seçilen dosya:</strong> {selectedFile.name}</p>
              <p><strong>Boyut:</strong> {selectedFile.size} bytes</p>
              <p><strong>Tip:</strong> {selectedFile.type}</p>
            </div>
          )}
        </div>

        {/* Test Butonları */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Testler</h2>
          <div className="flex gap-4">
            <button
              onClick={testUploadEndpoint}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔍 Endpoint Testi
            </button>
            <button
              onClick={testFileUpload}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              📤 Dosya Yükleme Testi
            </button>
            <button
              onClick={clearLogs}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              🗑️ Logları Temizle
            </button>
          </div>
        </div>

        {/* Loglar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📝 Debug Logları</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Henüz log yok...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}