'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import { apiService } from '@/services/api';
import { 
  FaFileInvoiceDollar, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaDownload,
  FaChartPie,
  FaBars,
  FaArrowUp,
  FaArrowDown,
  FaCalendar,
  FaMoneyBillWave
} from 'react-icons/fa';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  paymentMethod: string;
  invoiceNumber?: string;
}

export default function AccountingPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const hasAccountingSoftware = useFeature('accounting_software');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      description: 'Günlük Satış Geliri',
      category: 'Satış',
      type: 'income',
      amount: 12500,
      paymentMethod: 'Nakit',
      invoiceNumber: 'INV-2024-001'
    },
    {
      id: '2',
      date: new Date().toISOString().split('T')[0],
      description: 'Sebze ve Meyve Alımı',
      category: 'Malzeme',
      type: 'expense',
      amount: 3200,
      paymentMethod: 'Banka Transferi',
      invoiceNumber: 'EXP-2024-045'
    },
    {
      id: '3',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      description: 'Personel Maaşları',
      category: 'İnsan Kaynakları',
      type: 'expense',
      amount: 45000,
      paymentMethod: 'Banka Transferi'
    },
    {
      id: '4',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      description: 'Hafta Sonu Satışları',
      category: 'Satış',
      type: 'income',
      amount: 28000,
      paymentMethod: 'Kredi Kartı',
      invoiceNumber: 'INV-2024-002'
    },
    {
      id: '5',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      description: 'Elektrik Faturası',
      category: 'Faturalar',
      type: 'expense',
      amount: 2800,
      paymentMethod: 'Otomatik Ödeme',
      invoiceNumber: 'EXP-2024-046'
    },
    {
      id: '6',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      description: 'Et ve Tavuk Alımı',
      category: 'Malzeme',
      type: 'expense',
      amount: 8500,
      paymentMethod: 'Nakit',
      invoiceNumber: 'EXP-2024-047'
    },
    {
      id: '7',
      date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
      description: 'Hafta İçi Satışları',
      category: 'Satış',
      type: 'income',
      amount: 15600,
      paymentMethod: 'Karışık',
      invoiceNumber: 'INV-2024-003'
    },
    {
      id: '8',
      date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
      description: 'Temizlik Malzemeleri',
      category: 'Genel Giderler',
      type: 'expense',
      amount: 1200,
      paymentMethod: 'Nakit'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    // Demo için session kontrolü yok
  }, []);

  const handleAddTransaction = async (transactionData: Partial<Transaction>) => {
    const newTransaction: Transaction = {
      id: String(Date.now()),
      date: transactionData.date || new Date().toISOString().split('T')[0],
      description: transactionData.description || '',
      category: transactionData.category || '',
      type: transactionData.type || 'income',
      amount: transactionData.amount || 0,
      paymentMethod: transactionData.paymentMethod || '',
      invoiceNumber: transactionData.invoiceNumber
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setShowAddModal(false);
  };

  const handleUpdateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...transactionData } : t));
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) return;
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Demo için session kontrolü yok

  // Özellik kontrolü
  if (!hasAccountingSoftware) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FaFileInvoiceDollar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Muhasebe Entegrasyonu</h2>
          <p className="text-gray-600 mb-4">
            Bu özellik planınızda bulunmuyor. Muhasebe yazılımı entegrasyonu özelliğini kullanmak için planınızı yükseltin.
          </p>
          <button
            onClick={() => router.push('/business/settings')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Planı Yükselt
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.invoiceNumber && transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="ml-0 lg:ml-72">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaBars className="text-xl text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaFileInvoiceDollar className="text-emerald-600" />
                    Muhasebe Yönetimi
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Gelir ve giderlerinizi takip edin</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <FaDownload />
                  <span className="hidden sm:inline">Rapor Al</span>
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <FaPlus />
                  <span className="hidden sm:inline">Yeni İşlem</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-green-600">₺{totalIncome.toLocaleString()}</p>
                </div>
                <FaArrowUp className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Gider</p>
                  <p className="text-2xl font-bold text-red-600">₺{totalExpense.toLocaleString()}</p>
                </div>
                <FaArrowDown className="text-3xl text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Kar</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ₺{netProfit.toLocaleString()}
                  </p>
                </div>
                <FaMoneyBillWave className="text-3xl text-emerald-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Kar Marjı</p>
                  <p className="text-2xl font-bold text-blue-600">%{profitMargin}</p>
                </div>
                <FaChartPie className="text-3xl text-blue-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Açıklama, kategori veya fatura no ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Tüm İşlemler</option>
                <option value="income">Gelirler</option>
                <option value="expense">Giderler</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme Yöntemi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <FaCalendar className="text-gray-400" />
                          {new Date(transaction.date).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{transaction.description}</div>
                          {transaction.invoiceNumber && (
                            <div className="text-sm text-gray-500">{transaction.invoiceNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'income' ? (
                            <FaArrowUp className="text-green-500" />
                          ) : (
                            <FaArrowDown className="text-red-500" />
                          )}
                          <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          <FaEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-6">
              <FaFileInvoiceDollar className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">İşlem bulunamadı</p>
            </div>
          )}

          {/* Integration Info */}
          <div className="mt-6 bg-emerald-50 rounded-lg p-6 border border-emerald-200">
            <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <FaFileInvoiceDollar />
              Muhasebe Yazılımı Entegrasyonları
            </h3>
            <p className="text-sm text-emerald-800 mb-4">
              Logo, Netsis, Mikro ve diğer muhasebe yazılımları ile entegre olun.
            </p>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Entegrasyon Ayarları
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



