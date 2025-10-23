'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaShoppingCart, FaBell, FaArrowLeft, FaStar, FaPlus, FaInfo, FaUtensils, FaFilter } from 'react-icons/fa';
import useRestaurantStore from '@/store/useRestaurantStore';
import { useCartStore } from '@/store';
import Toast from '@/components/Toast';
import MenuItemModal from '@/components/MenuItemModal';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';
import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';
import QuickServiceModal from '@/components/QuickServiceModal';
import SetBrandColor from '@/components/SetBrandColor';
import apiService from '@/services/api';

function MenuPageContent() {
  // Store states
  const { currentLanguage, translate } = useLanguage();
  const addItem = useCartStore(state => state.addItem);
  const cartItems = useCartStore(state => state.items);
  const tableNumber = useCartStore(state => state.tableNumber);
  const setTableNumber = useCartStore(state => state.setTableNumber);
  
  // Restaurant store - backend'den gerçek veriler
  const { 
    restaurants, 
    categories, 
    menuItems, 
    fetchRestaurants, 
    fetchRestaurantMenu,
    loading 
  } = useRestaurantStore();
  
  // Local states
  const [activeCategory, setActiveCategory] = useState('popular');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState('Menüde ara...');
  const { settings } = useBusinessSettingsStore();
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenMessage, setTokenMessage] = useState('');
  const [isQuickServiceModalOpen, setIsQuickServiceModalOpen] = useState(false);
  const primary = settings.branding.primaryColor;
  const secondary = settings.branding.secondaryColor || settings.branding.primaryColor;
  
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

  // Load data on mount
  useEffect(() => {
    setIsClient(true);
    
    console.log('🔄 Menu page useEffect triggered');
    console.log('🏪 Current restaurants:', restaurants.length);
    console.log('📋 Current categories:', categories.length);
    console.log('🍽️ Current menuItems:', menuItems.length);
    
    // Load restaurants first
    fetchRestaurants().then(() => {
      const restaurant = getCurrentRestaurant();
      console.log('🏪 Found restaurant:', restaurant);
      if (restaurant) {
        console.log('🔄 Fetching menu for restaurant:', restaurant.id);
        fetchRestaurantMenu(restaurant.id);
      }
    });

    // Set search placeholder based on language
    if (currentLanguage === 'Turkish') {
      setSearchPlaceholder('Menüde ara...');
    } else {
      setSearchPlaceholder('Search menu...');
    }
  }, []); // Remove currentLanguage dependency to prevent re-runs

  // Filter menu items based on search and category
  const filteredItems = menuItems.filter((item: any) => {
    const matchesSearch = search === '' || 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = activeCategory === 'popular' ? 
      item.isPopular : 
      item.categoryId === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get final filtered items
  const finalFilteredItems = filteredItems;

  // Handle add to cart
  const handleAddToCart = (item: any) => {
      addItem({
      id: item.id,
        name: item.name,
      price: parseFloat(item.price),
      imageUrl: item.imageUrl,
      description: item.description,
      quantity: 1
      });
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
  };

  // Handle item click
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Handle quick service
  const handleQuickService = (serviceType: string, customNote?: string) => {
    if (!currentRestaurant) return;
    
    const serviceData = {
      restaurantId: currentRestaurant.id,
      tableNumber: tableNumber || 1,
      serviceType,
      customNote: customNote || '',
      timestamp: new Date().toISOString()
    };

    apiService.post('/service-call', serviceData)
      .then(() => {
        console.log('Service call sent:', serviceData);
        setIsQuickServiceModalOpen(false);
      })
      .catch(error => {
        console.error('Service call error:', error);
      });
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
    <>
      <SetBrandColor />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FaArrowLeft size={20} />
              </Link>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">
                    {currentRestaurant?.name || 'Restoran'}
                  </h1>
                  <p className="text-sm text-gray-600">
                <TranslatedText>Menü</TranslatedText>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    console.log('🔍 DEBUG INFO:');
                    console.log('Restaurants:', restaurants.length);
                    console.log('Categories:', categories.length);
                    console.log('Menu Items:', menuItems.length);
                    console.log('Current Restaurant:', currentRestaurant);
                    console.log('Loading:', loading);
                    console.log('Final Filtered Items:', finalFilteredItems.length);
                    console.log('Active Category:', activeCategory);
                    console.log('Search:', search);
                    
                    // Test API call
                    if (currentRestaurant) {
                      console.log('🔄 Testing API call...');
                      fetchRestaurantMenu(currentRestaurant.id);
                    }
                  }}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  DEBUG
                </button>
                
                <button
                  onClick={() => setIsQuickServiceModalOpen(true)}
                  className="flex flex-col items-center text-gray-600 hover:text-gray-800 transition-colors"
                  style={{ color: primary }}
                >
                  <FaBell className="mb-0.5" size={16} />
                  <span className="text-[10px]"><TranslatedText>Garson Çağır</TranslatedText></span>
                </button>
                
                <Link 
                  href="/cart" 
                  className="flex flex-col items-center text-gray-600 hover:text-gray-800 transition-colors relative"
                  style={{ color: primary }}
                >
                  <FaShoppingCart className="mb-0.5" size={16} />
                  <span className="text-[10px]"><TranslatedText>Sepet</TranslatedText></span>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </div>
          </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  setActiveCategory('popular');
                  setActiveSubcategory(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'popular'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{
                  backgroundColor: activeCategory === 'popular' ? primary : 'transparent'
                }}
              >
                <TranslatedText>Popüler</TranslatedText>
              </button>
              
              {categories.map((category: any) => (
              <button
                key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveSubcategory(null);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-800'
                }`}
                  style={{
                    backgroundColor: activeCategory === category.id ? primary : 'transparent'
                  }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        </div>

        {/* Menu Items */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600"><TranslatedText>Menü yükleniyor...</TranslatedText></p>
            </div>
          ) : finalFilteredItems.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FaUtensils className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                <TranslatedText>Ürün bulunamadı</TranslatedText>
              </h3>
              <p className="text-gray-600">
                <TranslatedText>Aradığınız kriterlere uygun ürün bulunamadı.</TranslatedText>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finalFilteredItems.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex">
                    <div className="w-24 h-24 relative flex-shrink-0">
                  <Image
                        src={item.imageUrl || '/placeholder-food.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        priority={false}
                      />
                    </div>
                    
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <FaStar className="text-yellow-400" size={12} />
                          <span className="text-xs text-gray-600">4.5</span>
                </div>
                  </div>
                      
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold" style={{ color: primary }}>
                          ₺{item.price}
                    </div>
                        
                        <div className="flex items-center space-x-2">
                    <button
                            onClick={() => handleItemClick(item)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                            <FaInfo size={14} />
                    </button>
                          
                    <button
                            onClick={() => handleAddToCart(item)}
                            className="p-2 rounded-full text-white transition-colors"
                            style={{ backgroundColor: primary }}
                    >
                            <FaPlus size={14} />
                    </button>
                  </div>
                </div>
              </div>
          </div>
        </div>
              ))}
              </div>
              )}
          </div>
        </div>

      {/* Modals */}
        <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
          item={selectedItem}
        onAddToCart={handleAddToCart}
      />

      <QuickServiceModal
        isOpen={isQuickServiceModalOpen}
        onClose={() => setIsQuickServiceModalOpen(false)}
        onServiceCall={handleQuickService}
      />

      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={translate('Ürün sepete eklendi!')}
        type="success"
      />
    </>
  );
}

export default function MenuPage() {
  return (
    <LanguageProvider>
      <MenuPageContent />
    </LanguageProvider>
  );
}