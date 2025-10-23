'use client';

import { useState, useEffect } from 'react';
import useRestaurantStore from '@/store/useRestaurantStore';
import apiService from '@/services/api';

export default function DebugMenuPage() {
  const { 
    restaurants, 
    categories, 
    menuItems, 
    fetchRestaurants, 
    fetchRestaurantMenu,
    loading 
  } = useRestaurantStore();
  
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [apiTest, setApiTest] = useState<any>({});

  // Get current restaurant
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

  useEffect(() => {
    fetchRestaurants().then(() => {
      if (currentRestaurant) {
        fetchRestaurantMenu(currentRestaurant.id);
      }
    });
  }, []);

  // Test API directly
  const testAPI = async () => {
    try {
      // Test restaurants endpoint
      const restaurantsResponse = await apiService.getRestaurants();
      console.log('🏪 Restaurants API:', restaurantsResponse);
      
      // Test menu endpoint
      if (currentRestaurant) {
        const menuResponse = await apiService.getRestaurantMenu(currentRestaurant.id);
        console.log('🍽️ Menu API:', menuResponse);
        setApiTest({
          restaurants: restaurantsResponse,
          menu: menuResponse
        });
      }
    } catch (error) {
      console.error('❌ API Test Error:', error);
      setApiTest({ error: error.message });
    }
  };

  // Test direct fetch
  const testDirectFetch = async () => {
    try {
      const response = await fetch('https://masapp-backend.onrender.com/api/restaurants');
      const data = await response.json();
      console.log('🌐 Direct fetch:', data);
      setDebugInfo({ directFetch: data });
    } catch (error) {
      console.error('❌ Direct fetch error:', error);
      setDebugInfo({ directFetchError: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Menü Debug Sayfası</h1>
        
        {/* Current State */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Mevcut Durum</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Loading:</strong> {loading ? '✅ Yükleniyor' : '❌ Yüklenmiyor'}</p>
              <p><strong>Restaurants:</strong> {restaurants?.length || 0}</p>
              <p><strong>Categories:</strong> {categories?.length || 0}</p>
              <p><strong>Menu Items:</strong> {menuItems?.length || 0}</p>
            </div>
            <div>
              <p><strong>Current Restaurant:</strong> {currentRestaurant?.name || 'Bulunamadı'}</p>
              <p><strong>Restaurant ID:</strong> {currentRestaurant?.id || 'Yok'}</p>
              <p><strong>Username:</strong> {currentRestaurant?.username || 'Yok'}</p>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Butonları</h2>
          <div className="space-x-4">
            <button
              onClick={testAPI}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              API Service Test
            </button>
            <button
              onClick={testDirectFetch}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Direct Fetch Test
            </button>
            <button
              onClick={() => {
                if (currentRestaurant) {
                  fetchRestaurantMenu(currentRestaurant.id);
                }
              }}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Refresh Menu
            </button>
          </div>
        </div>

        {/* Restaurants Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🏪 Restaurants Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(restaurants, null, 2)}
          </pre>
        </div>

        {/* Categories Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Categories Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(categories, null, 2)}
          </pre>
        </div>

        {/* Menu Items Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🍽️ Menu Items Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(menuItems, null, 2)}
          </pre>
        </div>

        {/* API Test Results */}
        {Object.keys(apiTest).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">🧪 API Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          </div>
        )}

        {/* Debug Info */}
        {Object.keys(debugInfo).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Debug Info</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Console Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📝 Console Logs</h2>
          <p className="text-gray-600">
            Browser console'u açın (F12) ve log'ları kontrol edin.
          </p>
        </div>
      </div>
    </div>
  );
}
