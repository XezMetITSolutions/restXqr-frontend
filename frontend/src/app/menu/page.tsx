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
    
    // Load restaurants first
    fetchRestaurants().then(() => {
      const restaurant = getCurrentRestaurant();
      if (restaurant) {
        fetchRestaurantMenu(restaurant.id);
      }
    });

    // Set search placeholder based on language
    if (currentLanguage === 'Turkish') {
      setSearchPlaceholder('Menüde ara...');
    } else {
          setSearchPlaceholder('Search menu...');
        }
  }, [currentLanguage]);

  // Filter menu items based on search and category
  const filteredItems = menuItems.filter((item: any) => {
    const matchesSearch = search === '' || 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = activeCategory === 'popular' ? 
      item.isPopular : 
      item.categoryId === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique subcategories
  const subcategories = Array.from(
    new Set(
      filteredItems
        .map((item: any) => item.subcategory)
        .filter(Boolean)
    )
  );

  // Filter by subcategory if selected
  const finalFilteredItems = activeSubcategory ? 
    filteredItems.filter((item: any) => item.subcategory === activeSubcategory) :
    filteredItems;

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
    setTimeout(() => setToastVisible(false), 2000);
  };

  // Handle item click
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
              </div>
              </div>
    );
  }

  if (!currentRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Restoran Bulunamadı</h1>
          <p className="text-gray-600 mb-4">Bu subdomain için restoran bulunamadı.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Ana sayfaya dön
          </Link>
            </div>
          </div>
    );
  }

  return (
    <>
      <SetBrandColor />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/" 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="text-gray-600" size={20} />
              </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {currentRestaurant.name}
              </h1>
              {tableNumber && (
                    <p className="text-sm text-gray-600">
                <TranslatedText>Masa</TranslatedText> #{tableNumber}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsQuickServiceModalOpen(true)}
                  className="flex flex-col items-center"
                  style={{ color: primary }}
                >
                  <FaBell className="mb-0.5" size={16} />
                  <span className="text-[10px]"><TranslatedText>Garson Çağır</TranslatedText></span>
                </button>
                
              <Link 
                  href="/cart" 
                  className="flex flex-col items-center relative"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaFilter className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex space-x-1 overflow-x-auto">
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
                <FaStar className="inline mr-1" size={12} />
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

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="bg-gray-50 border-b">
            <div className="max-w-4xl mx-auto px-4 py-2">
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => setActiveSubcategory(null)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    !activeSubcategory
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: !activeSubcategory ? secondary : 'transparent'
                  }}
                >
                  <TranslatedText>Tümü</TranslatedText>
                </button>
                
                {subcategories.map((subcategory: string) => (
                  <button
                    key={subcategory}
                    onClick={() => setActiveSubcategory(subcategory)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      activeSubcategory === subcategory
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{
                      backgroundColor: activeSubcategory === subcategory ? secondary : 'transparent'
                    }}
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600"><TranslatedText>Menü yükleniyor...</TranslatedText></p>
            </div>
          ) : finalFilteredItems.length === 0 ? (
            <div className="text-center py-12">
              <FaUtensils className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                <TranslatedText>Ürün bulunamadı</TranslatedText>
              </h3>
              <p className="text-gray-600">
                <TranslatedText>Aradığınız kriterlere uygun ürün bulunamadı.</TranslatedText>
              </p>
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
                        <span className="font-bold text-lg" style={{ color: primary }}>
                          {item.price}₺
                        </span>
                    </div>
                      
                      {item.description && (
                        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                    <button
                          onClick={() => handleItemClick(item)}
                          className="flex items-center text-xs text-gray-600 hover:text-gray-800"
                    >
                      <FaInfo className="mr-1" size={10} />
                          <TranslatedText>Detay</TranslatedText>
                    </button>
                        
                    <button
                          onClick={() => handleAddToCart(item)}
                          className="flex items-center px-3 py-1 rounded-full text-xs font-medium text-white transition-colors"
                          style={{ backgroundColor: primary }}
                    >
                      <FaPlus className="mr-1" size={10} />
                          <TranslatedText>Ekle</TranslatedText>
                    </button>
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
        </div>



        {/* Anlık Duyurular Slider */}

        <div className="px-3 mb-4">

          <div className="relative overflow-hidden rounded-lg shadow-lg">

            <div className="flex animate-slide">

              <div className="min-w-full text-white p-3 bg-brand-gradient">

                <div className="flex items-center">

                  <span className="text-lg mr-2">🎉</span>

                  <div>

                    <div className="font-semibold text-sm">

                      <TranslatedText>Bugüne Özel!</TranslatedText>

                    </div>

                    <div className="text-xs opacity-90">

                      <TranslatedText>Tüm tatlılarda %20 indirim - Sadece bugün geçerli</TranslatedText>

                    </div>

                  </div>

                </div>

              </div>

              <div className="min-w-full text-white p-3 bg-brand-gradient">

                <div className="flex items-center">

                  <span className="text-lg mr-2">🍲</span>

                  <div>

                    <div className="font-semibold text-sm">

                      <TranslatedText>Günün Çorbası</TranslatedText>

                    </div>

                    <div className="text-xs opacity-90">

                      <TranslatedText>Ezogelin çorbası - Ev yapımı lezzet</TranslatedText>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>



        <style jsx>{`

          @keyframes slide {

            0%, 45% { transform: translateX(0); }

            50%, 95% { transform: translateX(-100%); }

            100% { transform: translateX(0); }

          }

          .animate-slide {

            animation: slide 8s infinite;

          }

        `}</style>



        {/* Categories */}

        <div className="pb-2 overflow-x-auto">

          <div className="flex px-3 space-x-2 min-w-max">

            {menuCategories.map((category) => (

              <button

                key={category.id}

                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-dynamic-sm ${

                  activeCategory === category.id

                    ? 'btn-gradient'

                    : 'bg-brand-surface text-gray-700'

                }`}

                onClick={() => handleCategoryChange(category.id)}

              >

                {category.name}

              </button>

            ))}

          </div>

        </div>



        {/* Subcategories - Backend'de subcategory yok, bu kısım kaldırıldı */}



        {/* Menu Items */}

        <div className="container mx-auto px-3 py-2">

          <div className="grid grid-cols-1 gap-3">

            {filteredItems.map((item: any) => (

              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-3 flex">

                <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">

                  <Image
                    src={item.imageUrl ? 
                      (item.imageUrl.startsWith('http') ? 
                        item.imageUrl : 
                        `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`) 
                      : '/placeholder-food.jpg'} 
                    alt={typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Menu item')} 
                    width={80}
                    height={80}
                    className="object-cover w-full h-full rounded-lg"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    priority={false}
                  />

                  {item.isPopular && (

                    <div className="absolute top-0 left-0 text-white text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--brand-strong)' }}>

                      <FaStar className="inline-block mr-1" size={8} />

                      <TranslatedText>Popüler</TranslatedText>

                    </div>

                  )}

                </div>

                <div className="ml-3 flex-grow">

                  <div className="flex justify-between items-start">

                    <h3 className="font-semibold text-dynamic-sm">{typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün')}</h3>

                    <span className="font-semibold text-dynamic-sm" style={{ color: primary }}>{item.price} ₺</span>

                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">

                    {typeof item.description === 'string' ? item.description : (item.description?.tr || item.description?.en || '')}

                  </p>



                  {/* Allergens */}

                  {item.allergens && item.allergens.length > 0 && (

                    <div className="flex flex-wrap gap-1 mb-2">

                      {item.allergens.slice(0, 3).map((allergen: any, i: number) => (

                        <span key={i} className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full">

                          {typeof allergen === 'string' ? allergen : (allergen[language as keyof typeof allergen] || allergen.tr || allergen.en)}

                        </span>

                      ))}

                    </div>

                  )}

                  
                  
                  {/* Debug: Allergens */}

                  {process.env.NODE_ENV === 'development' && item.allergens && (

                    <div className="text-xs text-gray-400">

                      Debug: {JSON.stringify(item.allergens)}

                    </div>

                  )}



                  <div className="flex justify-between items-center">

                    <button

                      onClick={() => openModal(item)}

                      className="text-xs flex items-center"

                      style={{ color: primary }}

                    >

                      <FaInfo className="mr-1" size={10} />

                      <TranslatedText>Detayları Gör</TranslatedText>

                    </button>

                    <button

                      className="btn btn-secondary py-1 px-3 text-xs rounded flex items-center"

                      onClick={() => addToCart(item)}

                    >

                      <FaPlus className="mr-1" size={10} />

                      <TranslatedText>Sepete Ekle</TranslatedText>

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>



        {/* Sabit Duyurular */}

        <div className="container mx-auto px-3 py-4 mb-20">

          <div className="rounded-xl p-5 shadow-lg border bg-tone1">

            <div className="grid grid-cols-1 gap-3">

              {/* WiFi Info */}

              {settings.basicInfo.showWifiInMenu && (

              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-subtle)' }}>

                <div className="flex items-center">

                  <span className="text-lg mr-3">📶</span>

                  <span className="text-sm font-medium text-gray-700">

                    <TranslatedText>WiFi Şifresi</TranslatedText>

                  </span>

                </div>

                  <span className="text-sm font-bold px-2 py-1 rounded" style={{ color: 'var(--brand-strong)', backgroundColor: 'var(--brand-surface)' }}>

                    {settings.basicInfo.wifiPassword || 'restoran2024'}

                  </span>

              </div>

              )}

              {/* Google Review Button */}

              <a

                href="https://www.google.com/maps/place/restoranadi/reviews" // Change to actual Google review URL

                target="_blank"

                rel="noopener noreferrer"

                className="flex items-center justify-between p-3 rounded-lg shadow-sm border-l-4 transition group bg-tone2"

                style={{ textDecoration: 'none' }}

              >

                <div className="flex items-center">

                  <span className="text-lg mr-3">⭐</span>

                  <span className="text-sm font-medium text-gray-800">

                    <TranslatedText>Google'da Değerlendir</TranslatedText>

                  </span>

                </div>

                <button className="text-xs font-semibold px-3 py-1 rounded-lg shadow group-hover:scale-105 transition btn-secondary">

                  <TranslatedText>Yorum Yap</TranslatedText>

                </button>

              </a>

              {/* Working Hours */}

              {settings.basicInfo.showHoursInMenu && (

              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-subtle)' }}>

                <div className="flex items-center">

                  <span className="text-lg mr-3">🕒</span>

                  <span className="text-sm font-medium text-gray-700">

                    <TranslatedText>Çalışma Saatleri</TranslatedText>

                  </span>

                </div>

                  <span className="text-sm font-bold" style={{ color: 'var(--brand-strong)' }}>

                    {settings.basicInfo.workingHours || '09:00 - 23:00'}

                  </span>

              </div>

              )}

              {/* Instagram Button */}

              {settings.basicInfo.showInstagramInMenu && (

              <a

                  href={settings.basicInfo.instagram || "https://instagram.com/restoranadi"}

                target="_blank"

                rel="noopener noreferrer"

                className="flex items-center justify-between p-3 rounded-lg shadow-sm border-l-4 transition group bg-tone3"

                style={{ textDecoration: 'none' }}

              >

                <div className="flex items-center">

                  <span className="text-lg mr-3">📱</span>

                  <span className="text-sm font-medium text-gray-800">

                    <TranslatedText>Instagram'da Takip Et</TranslatedText>

                  </span>

                </div>

                <button className="text-sm font-bold px-3 py-1 rounded-lg shadow group-hover:scale-105 transition btn-primary">

                    @{settings.basicInfo.instagram?.replace('https://instagram.com/', '').replace('https://www.instagram.com/', '') || 'restoranadi'}

                </button>

              </a>

              )}

            </div>

          </div>

        </div>



        {/* Bottom Navigation */}

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 shadow-lg">

          <div className="container mx-auto flex justify-around">

            <Link href="/menu" className="flex flex-col items-center" style={{ color: primary }}>

              <FaUtensils className="mb-0.5" size={16} />

              <span className="text-[10px]"><TranslatedText>Menü</TranslatedText></span>

            </Link>

            <Link href="/cart" className="flex flex-col items-center" style={{ color: primary }}>

              <div className="relative">

                <FaShoppingCart className="mb-0.5" size={16} />

                {isClient && cartCount > 0 && (

                  <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">

                    {cartCount}

                  </span>

                )}

              </div>

              <span className="text-[10px]"><TranslatedText>Sepet</TranslatedText></span>

            </Link>

            <Link href="/waiter" className="flex flex-col items-center" style={{ color: primary }}>

              <FaBell className="mb-0.5" size={16} />

              <span className="text-[10px]"><TranslatedText>Garson Çağır</TranslatedText></span>

            </Link>

          </div>

        </nav>

      </main>



      {/* Menu Item Modal */}

      {selectedItem && (

        <MenuItemModal

          item={selectedItem}

          isOpen={isModalOpen}

          onClose={closeModal}

        />

      )}

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
