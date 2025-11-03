import { useAuthStore } from '@/store/useAuthStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import { useEffect, useState, useMemo } from 'react';

/**
 * Restaurant'a özel özellik kontrolü için hook - REAL-TIME
 * Backend'den canlı veri çeker, localStorage kullanmaz
 * 
 * @param featureId - Kontrol edilecek özellik ID'si
 * @returns boolean - Özellik aktif mi?
 */
export function useFeature(featureId: string): boolean {
  const { authenticatedRestaurant } = useAuthStore();
  const { restaurants, fetchRestaurantByUsername } = useRestaurantStore();
  const [loading, setLoading] = useState(false);
  
  // Demo panelde tüm özellikler aktif
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');
  if (isDemo) {
    console.log('📦 useFeature: Demo mode - all features enabled');
    return true;
  }
  
  // Real-time data fetch için subdomain'i al ve backend'den çek
  useEffect(() => {
    // Demo panelde backend'e gitme
    if (isDemo) {
      console.log('📦 useFeature: Demo mode, skipping fetch');
      return;
    }
    
    if (typeof window !== 'undefined') {
      const subdomain = window.location.hostname.split('.')[0];
      if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
        console.log('🔍 useFeature: Fetching data for subdomain:', subdomain);
        setLoading(true);
        fetchRestaurantByUsername(subdomain).finally(() => {
          setLoading(false);
          console.log('✅ useFeature: Fetch completed for subdomain:', subdomain);
        });
      }
    }
  }, [fetchRestaurantByUsername]);
  
  // Debug logging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const subdomain = window.location.hostname.split('.')[0];
      const restaurant = restaurants.find(r => r.username === subdomain);
      console.log('🎯 useFeature Debug:', {
        featureId,
        subdomain,
        authenticatedRestaurant: authenticatedRestaurant?.features,
        restaurantFromStore: restaurant?.features,
        totalRestaurants: restaurants.length
      });
    }
  }, [featureId, authenticatedRestaurant, restaurants]);
  
  // Önce authenticated restaurant'ı kontrol et
  if (authenticatedRestaurant) {
    console.log('🔐 useFeature: Using authenticated restaurant features:', authenticatedRestaurant.features);
    return authenticatedRestaurant.features?.includes(featureId) ?? false;
  }
  
  // Authenticated yoksa subdomain'e göre restaurant bul (backend'den çekilmiş)
  if (typeof window !== 'undefined') {
    const subdomain = window.location.hostname.split('.')[0];
    const restaurant = restaurants.find(r => r.username === subdomain);
    
    if (restaurant) {
      console.log('🏪 useFeature: Using restaurant from store:', restaurant.features);
      return restaurant.features?.includes(featureId) ?? false;
    }
  }
  
  console.log('❌ useFeature: No features found, returning false');
  return false;
}

/**
 * Birden fazla özelliği kontrol etmek için hook
 * 
 * @param featureIds - Kontrol edilecek özellik ID'leri
 * @returns object - Her özellik için boolean değer
 * 
 * @example
 * const features = useFeatures(['google_reviews', 'online_ordering', 'loyalty_program']);
 * 
 * return (
 *   <>
 *     {features.google_reviews && <GoogleReviewsWidget />}
 *     {features.online_ordering && <OnlineOrderButton />}
 *     {features.loyalty_program && <LoyaltyPoints />}
 *   </>
 * );
 */
export function useFeatures(featureIds: string[]): Record<string, boolean> {
  const { authenticatedRestaurant } = useAuthStore();
  const { restaurants } = useRestaurantStore();
  const [remoteFeatures, setRemoteFeatures] = useState<string[] | null>(null);

  // Demo panelde tüm özellikler aktif
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');
  if (isDemo) {
    return featureIds.reduce((acc, id) => ({ ...acc, [id]: true }), {} as Record<string, boolean>);
  }

  const local = useMemo(() => {
    if (authenticatedRestaurant) {
      return featureIds.reduce((acc, id) => ({
        ...acc,
        [id]: authenticatedRestaurant.features?.includes(id) ?? false
      }), {} as Record<string, boolean>);
    }
    if (typeof window !== 'undefined') {
      const subdomain = window.location.hostname.split('.')[0];
      const restaurant = restaurants.find(r => r.username === subdomain);
      if (restaurant) {
        return featureIds.reduce((acc, id) => ({
          ...acc,
          [id]: restaurant.features?.includes(id) ?? false
        }), {} as Record<string, boolean>);
      }
    }
    return null;
  }, [authenticatedRestaurant?.id, authenticatedRestaurant?.features, restaurants, featureIds.join('|')]);

  useEffect(() => {
    // Demo panelde backend'e gitme
    const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');
    if (isDemo) {
      console.log('📦 useFeatures: Demo mode, skipping fetch');
      return;
    }
    
    if (local) return;
    if (authenticatedRestaurant) return;
    if (typeof window === 'undefined') return;
    const subdomain = window.location.hostname.split('.')[0];
    if (!subdomain) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/restaurants/${encodeURIComponent(subdomain)}/features`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setRemoteFeatures(Array.isArray(data?.features) ? data.features : []);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [local, authenticatedRestaurant?.id, featureIds.join('|')]);

  if (local) return local;
  if (remoteFeatures) {
    return featureIds.reduce((acc, id) => ({ ...acc, [id]: remoteFeatures.includes(id) }), {} as Record<string, boolean>);
  }
  return featureIds.reduce((acc, id) => ({ ...acc, [id]: false }), {} as Record<string, boolean>);
}

/**
 * Tüm aktif özellikleri döndüren hook
 * 
 * @returns string[] - Aktif özellik ID'leri
 * 
 * @example
 * const activeFeatures = useActiveFeatures();
 * console.log('Aktif özellikler:', activeFeatures);
 */
export function useActiveFeatures(): string[] {
  const { authenticatedRestaurant } = useAuthStore();
  const { restaurants } = useRestaurantStore();
  const [remoteFeatures, setRemoteFeatures] = useState<string[] | null>(null);

  // Demo panelde tüm özellikler aktif - tüm mevcut özellikleri döndür
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');
  if (isDemo) {
    return [
      'basic_reports',
      'advanced_analytics',
      'google_reviews',
      'online_ordering',
      'loyalty_program',
      'custom_branding',
      'multi_location',
      'api_access'
    ];
  }

  const local = useMemo(() => {
    if (authenticatedRestaurant) return authenticatedRestaurant.features ?? [];
    if (typeof window !== 'undefined') {
      const subdomain = window.location.hostname.split('.')[0];
      const restaurant = restaurants.find(r => r.username === subdomain);
      if (restaurant) return restaurant.features ?? [];
    }
    return null;
  }, [authenticatedRestaurant?.id, authenticatedRestaurant?.features, restaurants]);

  useEffect(() => {
    // Demo panelde backend'e gitme
    const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');
    if (isDemo) {
      console.log('📦 useActiveFeatures: Demo mode, skipping fetch');
      return;
    }
    
    if (local) return;
    if (authenticatedRestaurant) return;
    if (typeof window === 'undefined') return;
    const subdomain = window.location.hostname.split('.')[0];
    if (!subdomain) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/restaurants/${encodeURIComponent(subdomain)}/features`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setRemoteFeatures(Array.isArray(data?.features) ? data.features : []);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [local, authenticatedRestaurant?.id]);

  return local ?? remoteFeatures ?? [];
}

/**
 * Özellik sayısını döndüren hook
 * 
 * @returns number - Aktif özellik sayısı
 */
export function useFeatureCount(): number {
  const local = useActiveFeatures();
  return local.length;
}
