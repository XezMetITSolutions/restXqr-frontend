'use client';

import Link from 'next/link';

export default function AdminSupport() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Destek</h1>
        <p className="text-gray-600 mb-4">Sorularınız için bize ulaşın.</p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>E-posta: support@masapp.com</li>
          <li><Link className="text-blue-600 underline" href="/admin/documentation">Dokümantasyon</Link></li>
        </ul>
      </div>
    </div>
  );
}


