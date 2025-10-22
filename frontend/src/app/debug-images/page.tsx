'use client';

import { useState } from 'react';

export default function DebugImagesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

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
      setUploadResult({ error: error.message });
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
      setTestResult({ error: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">🖼️ Image Debug Page</h1>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-2">API Configuration</h2>
          <div className="text-sm text-gray-700">
            <div>API URL: {API_URL}</div>
          </div>
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

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Upload Result</h3>
            {uploadResult && (
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            )}
          </div>

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
