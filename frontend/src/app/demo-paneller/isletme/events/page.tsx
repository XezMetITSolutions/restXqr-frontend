'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import { apiService } from '@/services/api';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaUsers,
  FaMapMarkerAlt,
  FaClock,
  FaBars,
  FaCheckCircle,
  FaTimesCircle,
  FaMusic,
  FaUtensils
} from 'react-icons/fa';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  type: 'concert' | 'dinner' | 'party' | 'workshop' | 'other';
  price: number;
}

export default function EventsPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const hasEventManagement = useFeature('event_management');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Demo için session kontrolü yok else {
      fetchEvents();
    }
  }, [isAuthenticated, router]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const restaurantId = user?.id;
      if (!restaurantId) return;
      
      const response = await apiService.getEvents(restaurantId);
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (eventData: Partial<Event>) => {
    try {
      const restaurantId = user?.id;
      if (!restaurantId) return;

      const response = await apiService.createEvent({
        ...eventData,
        restaurantId
      });
      
      if (response.success) {
        await fetchEvents();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Etkinlik eklenirken hata:', error);
    }
  };

  const handleUpdateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      const response = await apiService.updateEvent(id, eventData);
      if (response.success) {
        await fetchEvents();
        setEditingEvent(null);
      }
    } catch (error) {
      console.error('Etkinlik güncellenirken hata:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await apiService.deleteEvent(id);
      if (response.success) {
        await fetchEvents();
      }
    } catch (error) {
      console.error('Etkinlik silinirken hata:', error);
    }
  };

  useEffect(() => {
    // Demo için session kontrolü yok
  }, [isAuthenticated, router]);

  // Özellik kontrolü
  if (!hasEventManagement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Etkinlik Yönetimi</h2>
          <p className="text-gray-600 mb-4">
            Bu özellik planınızda bulunmuyor. Etkinlik yönetimi özelliğini kullanmak için planınızı yükseltin.
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'ongoing': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <FaClock />;
      case 'ongoing': return <FaCheckCircle />;
      case 'completed': return <FaCheckCircle />;
      case 'cancelled': return <FaTimesCircle />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Yaklaşan';
      case 'ongoing': return 'Devam Ediyor';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'concert': return <FaMusic className="text-purple-500" />;
      case 'dinner': return <FaUtensils className="text-orange-500" />;
      case 'party': return <FaUsers className="text-pink-500" />;
      case 'workshop': return <FaCalendarAlt className="text-blue-500" />;
      default: return <FaCalendarAlt className="text-gray-500" />;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
  const totalCapacity = events.filter(e => e.status === 'upcoming').reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistered = events.filter(e => e.status === 'upcoming').reduce((sum, e) => sum + e.registered, 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.registered * e.price), 0);

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
                    <FaCalendarAlt className="text-pink-600" />
                    Etkinlik Yönetimi
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Özel etkinliklerinizi planlayın ve yönetin</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
              >
                <FaPlus />
                <span className="hidden sm:inline">Yeni Etkinlik</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Yaklaşan Etkinlik</p>
                  <p className="text-2xl font-bold text-blue-600">{upcomingEvents}</p>
                </div>
                <FaCalendarAlt className="text-3xl text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Kapasite</p>
                  <p className="text-2xl font-bold text-purple-600">{totalCapacity}</p>
                </div>
                <FaUsers className="text-3xl text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Kayıtlı Katılımcı</p>
                  <p className="text-2xl font-bold text-green-600">{totalRegistered}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-pink-600">₺{totalRevenue.toLocaleString()}</p>
                </div>
                <FaCalendarAlt className="text-3xl text-pink-500" />
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
                  placeholder="Etkinlik adı, açıklama veya lokasyon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="upcoming">Yaklaşan</option>
                <option value="ongoing">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal</option>
              </select>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900">{event.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                            {getStatusIcon(event.status)}
                            {getStatusText(event.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaCalendarAlt className="text-gray-400" />
                            <span>{new Date(event.date).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaClock className="text-gray-400" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaMapMarkerAlt className="text-gray-400" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaUsers className="text-gray-400" />
                            <span>{event.registered}/{event.capacity} kişi</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Bilet Fiyatı: </span>
                        <span className="font-bold text-pink-600">₺{event.price}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Doluluk: </span>
                        <span className="font-bold text-gray-900">
                          %{Math.round((event.registered / event.capacity) * 100)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                        <FaEdit />
                      </button>
                      <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Etkinlik bulunamadı</p>
            </div>
          )}

          {/* Event Info */}
          <div className="mt-6 bg-pink-50 rounded-lg p-6 border border-pink-200">
            <h3 className="font-bold text-pink-900 mb-2 flex items-center gap-2">
              <FaCalendarAlt />
              Etkinlik Yönetimi Avantajları
            </h3>
            <p className="text-sm text-pink-800 mb-4">
              Özel etkinlikler düzenleyerek müşteri sadakatini artırın ve ek gelir elde edin.
            </p>
            <ul className="text-sm text-pink-800 space-y-2">
              <li>✓ Online rezervasyon sistemi</li>
              <li>✓ Otomatik hatırlatma mesajları</li>
              <li>✓ Kapasite ve katılımcı takibi</li>
              <li>✓ Gelir raporlama</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}




