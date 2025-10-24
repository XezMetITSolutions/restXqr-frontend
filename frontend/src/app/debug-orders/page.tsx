'use client';

import { useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import useRestaurantStore from '@/store/useRestaurantStore';

type Json = any;

export default function DebugOrdersPage() {
  const { restaurants } = useRestaurantStore();
  const [hostname, setHostname] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [tableNumber, setTableNumber] = useState('5');
  const [createResult, setCreateResult] = useState<Json>(null);
  const [listResult, setListResult] = useState<Json>(null);

  const API_URL = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
    return base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const sd = host.split('.')[0] || '';
      setHostname(host);
      setSubdomain(sd);
    }
  }, []);

  useEffect(() => {
    // try resolve restaurant by subdomain from store first
    const r = restaurants.find((x: any) => x.username === subdomain);
    if (r?.id) {
      setRestaurantId(r.id);
      return;
    }
    // fallback: resolve from backend list
    const resolveFromBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/staff/restaurants`);
        const data = await res.json();
        const found = Array.isArray(data?.data) ? data.data.find((x: any) => x.username === subdomain) : null;
        if (found?.id) setRestaurantId(found.id);
      } catch (e) {
        // ignore
      }
    };
    resolveFromBackend();
  }, [restaurants, subdomain]);

  const doCreateOrder = async () => {
    try {
      if (!restaurantId) { setCreateResult({ error: 'restaurantId missing' }); return; }
      const res = await apiService.createOrder({
        restaurantId,
        tableNumber: Number(tableNumber) || 5,
        items: [
          { id: 'debug-1', name: 'DEBUG Kebap', quantity: 1, price: 50, notes: 'debug' },
          { id: 'debug-2', name: 'DEBUG Ayran', quantity: 1, price: 10 }
        ],
        notes: 'debug-order',
        orderType: 'dine_in'
      });
      setCreateResult(res);
    } catch (e: any) {
      setCreateResult({ error: true, message: e?.message });
    }
  };

  const doListOrders = async () => {
    try {
      if (!restaurantId) { setListResult({ error: 'restaurantId missing' }); return; }
      const res = await apiService.getOrders(restaurantId);
      setListResult(res);
    } catch (e: any) {
      setListResult({ error: true, message: e?.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">🧪 Orders Debug</h1>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-2">Ortam</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <div>Hostname: {hostname || '-'}</div>
            <div>Subdomain: {subdomain || '-'}</div>
            <div>API URL: {API_URL}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded border space-y-3">
          <h2 className="font-semibold">Parametreler</h2>
          <div className="flex gap-2">
            <input className="border rounded px-3 py-2 w-full" placeholder="restaurantId" value={restaurantId} onChange={e=>setRestaurantId(e.target.value)} />
            <button onClick={async ()=>{
              // manual resolve
              try {
                const res = await fetch(`${API_URL}/staff/restaurants`);
                const data = await res.json();
                const found = Array.isArray(data?.data) ? data.data.find((x: any) => x.username === subdomain) : null;
                if (found?.id) setRestaurantId(found.id);
              } catch {}
            }} className="px-3 py-2 bg-gray-800 text-white rounded">Bul</button>
          </div>
          <input className="border rounded px-3 py-2 w-full" placeholder="table" value={tableNumber} onChange={e=>setTableNumber(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={doCreateOrder} className="bg-green-600 text-white rounded px-4 py-2">Sipariş Oluştur (POST)</button>
            <button onClick={doListOrders} className="bg-indigo-600 text-white rounded px-4 py-2">Siparişleri Çek (GET)</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Create Order Response</h3>
            {createResult && <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(createResult, null, 2)}</pre>}
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">List Orders Response</h3>
            {listResult && <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(listResult, null, 2)}</pre>}
          </div>
        </div>
      </div>
    </div>
  );
}


