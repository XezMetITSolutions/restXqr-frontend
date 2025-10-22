'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function BusinessKitchenPage() {
  const router = useRouter();
  const { isAuthenticated, authenticatedStaff, authenticatedRestaurant } = useAuthStore();

  useEffect(() => {
    // Login kontrolü
    if (!isAuthenticated()) {
      router.replace('/business/login');
      return;
    }

    // Sadece aşçı (chef) rolündeki personel mutfak paneline erişebilir
    if (authenticatedStaff?.role !== 'chef' && authenticatedRestaurant?.role !== 'chef') {
      router.replace('/business/login');
      return;
    }

    // Business kitchen sayfasından doğrudan mutfak paneline yönlendir
    router.replace('/kitchen');
  }, [router, isAuthenticated, authenticatedStaff, authenticatedRestaurant]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Mutfak paneline yönlendiriliyor...</p>
      </div>
    </div>
  );
}
