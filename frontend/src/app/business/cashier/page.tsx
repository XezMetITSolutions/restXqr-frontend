'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import useOrderStore from '@/store/useOrderStore';
import useCartStore from '@/store/useCartStore';
import useBillRequestStore from '@/store/useBillRequestStore';
import useNotificationStore from '@/store/useNotificationStore';
import useCentralOrderStore from '@/store/useCentralOrderStore';
import { subscribe } from '@/lib/realtime';
import { publish } from '@/lib/realtime';
import { FaCreditCard, FaMoneyBillWave, FaQrcode, FaPrint, FaCheck, FaClock, FaUtensils, FaReceipt, FaSearch, FaFilter, FaPlus, FaMinus, FaTimes, FaShoppingCart, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import { Order } from '@/store/useOrderStore';
import { menuData, MenuItem } from '@/data/menu-data';

export default function CashierDashboard() {
  const router = useRouter();
  const { user, logout, authenticatedRestaurant, authenticatedStaff, isAuthenticated } = useAuthStore();
  
  // Restoran adını al - subdomain'e göre kişiselleştir
  const getRestaurantName = () => {
    if (typeof window !== 'undefined') {
      const subdomain = window.location.hostname.split('.')[0];
      switch (subdomain) {
        case 'lezzet':
          return 'Lezzet Restaurant';
        case 'kardesler':
          return 'Kardeşler Lokantası';
        case 'pizza':
          return 'Pizza Palace';
        case 'cafe':
          return 'Cafe Central';
        default:
          return authenticatedRestaurant?.name || authenticatedStaff?.name || 'MasApp';
      }
    }
    return authenticatedRestaurant?.name || authenticatedStaff?.name || 'MasApp';
  };
  
  const restaurantName = getRestaurantName();
  const { orders: oldOrders, updateOrderStatus } = useOrderStore();
  const { clearCart } = useCartStore();
  const { 
    getBillRequestsByStatus, 
    generateBill, 
    updateBillRequestStatus,
    getBillById,
    updateBillStatus
  } = useBillRequestStore();
  const { 
    createBillReadyNotification,
    createPaymentCompletedNotification,
    getActiveNotifications,
    markAsAcknowledged
  } = useNotificationStore();
  const { 
    getActiveOrders,
    updateOrderStatus: updateCentralOrderStatus,
    initializeDemoData
  } = useCentralOrderStore();
  
  // Demo veriler kaldırıldı - gerçek veriler API'den gelecek
  
  // Test için demo data initialize et
  useEffect(() => {
    // Login kontrolü
    if (!isAuthenticated()) {
      router.replace('/business/login');
      return;
    }

    // Real-time connection için EventSource
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://masapp-backend.onrender.com';
    const eventSource = new EventSource(`${baseUrl}/api/events/orders`);
    
    eventSource.onopen = () => {
      console.log('Cashier dashboard connected to real-time updates');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_order') {
          console.log('New order received in cashier:', data);
          // Yeni sipariş geldiğinde bildirim göster
          createBillReadyNotification({
            id: `order-${data.data.orderId}`,
            type: 'new_order',
            message: `Masa ${data.data.tableNumber} için yeni sipariş`,
            tableNumber: data.data.tableNumber,
            orderId: data.data.orderId,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error parsing real-time data in cashier:', error);
      }
    };

    eventSource.onerror = () => {
      console.error('Cashier real-time connection error');
    };

    return () => {
      eventSource.close();
      console.log('Cashier SSE connection closed');
    };

    // Sadece kasiyer (cashier) rolündeki personel kasa paneline erişebilir
    if (authenticatedStaff?.role !== 'cashier' && authenticatedRestaurant?.role !== 'cashier') {
      router.replace('/business/login');
      return;
    }

    initializeDemoData();
  }, [initializeDemoData, router, isAuthenticated, authenticatedStaff, authenticatedRestaurant]);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [tipAmount, setTipAmount] = useState(0);
  const [paymentType, setPaymentType] = useState<'single' | 'split' | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'ready' | 'delivered'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [currentOrderItems, setCurrentOrderItems] = useState<Array<{
    id: string;
    name: {en: string, tr: string};
    price: number;
    quantity: number;
  }>>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Gelişmiş ödeme sistemi state'leri
  const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false);
  const [splitPayments, setSplitPayments] = useState<Array<{method: 'cash' | 'card', amount: number, items: Array<{id: string, name: {en: string, tr: string}, price: number, quantity: number}>}>>([]);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [selectedItemsForPayment, setSelectedItemsForPayment] = useState<Array<{id: string, name: {en: string, tr: string}, price: number, quantity: number, selected: boolean, paymentQuantity: number}>>([]);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [showTableTransferNotification, setShowTableTransferNotification] = useState(false);
  const [tableTransferNotification, setTableTransferNotification] = useState<any>(null);
  const [showBillRequests, setShowBillRequests] = useState(false);
  const [billRequests, setBillRequests] = useState<any[]>([]);
  const [incomingBillBlink, setIncomingBillBlink] = useState<{table:number}|null>(null);

  // Listen realtime bill requests
  useEffect(() => {
    const un = subscribe((evt) => {
      if (evt.type === 'waiter_request' && evt.payload?.type === 'bill') {
        setIncomingBillBlink({ table: evt.payload.tableNumber });
      }
    });
    return un;
  }, []);

  // Siparişler - CentralOrderStore'dan al
  const centralOrders = getActiveOrders();
  
  // CentralOrder'ı Order formatına çevir
  const demoOrders: Order[] = centralOrders.map(centralOrder => ({
    id: centralOrder.id,
    tableNumber: centralOrder.tableNumber,
    items: centralOrder.items.map(item => ({
      id: item.id,
      name: { tr: item.name, en: item.name },
      price: item.price,
      quantity: item.quantity,
      category: item.category || 'food',
      notes: item.notes || ''
    })),
    total: centralOrder.totalAmount,
    status: centralOrder.status as 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid',
    timestamp: new Date(centralOrder.createdAt).getTime(),
    notes: '',
    paymentMethod: null,
    customerName: '',
    customerPhone: ''
  }));

  const filteredOrders = demoOrders.filter(order => {
    const matchesSearch = order.tableNumber.toString().includes(searchTerm) ||    
                         order.items.some(item => 
                           item.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.name.tr.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Siparişleri duruma göre sırala: aktif siparişler üstte, ödenen siparişler altta
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // Ödenen siparişler en alta
    if (a.status === 'paid' && b.status !== 'paid') return 1;
    if (b.status === 'paid' && a.status !== 'paid') return -1;
    
    // Diğer durumlar için timestamp'e göre sırala (yeni üstte)
    return b.timestamp - a.timestamp;
  });

  const handlePayment = async () => {
    if (!selectedOrder) return;
    
    setIsProcessing(true);
    
    // Ödeme işlemi simülasyonu
    setTimeout(() => {
      // Sipariş durumunu "ödendi" olarak güncelle
      updateOrderStatus(selectedOrder.id, 'paid');
      
      // Ödeme bildirimi oluştur
      createPaymentNotification(selectedOrder.id, paymentMethod === 'cash' ? 'Nakit' : 'Kart');
      
      // Ödeme kaydı oluştur
      const paymentRecord = {
        orderId: selectedOrder.id,
        tableNumber: selectedOrder.tableNumber,
        amount: selectedOrder.total,
        method: paymentMethod,
        tip: 0,
        timestamp: new Date().toISOString(),
        cashier: 'MasApp'
      };
      
      // Local storage'a kaydet
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      payments.push(paymentRecord);
      localStorage.setItem('payments', JSON.stringify(payments));
      
      setIsProcessing(false);
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setPaymentType(null);
    }, 1000);
  };

  // Ödeme türü seçimi
  const handlePaymentTypeSelection = (type: 'single' | 'split') => {
    setPaymentType(type);
    
    if (type === 'split') {
      const totalAmount = selectedOrder?.total || 0;
      setRemainingAmount(totalAmount);
      setSplitPayments([]);
      
    // Sipariş ürünlerini seçim için hazırla
    const itemsForSelection = selectedOrder?.items.map(item => ({
      ...item,
      selected: false,
      paymentQuantity: 0
    })) || [];
    setSelectedItemsForPayment(itemsForSelection);
    }
  };

  // Ürün seçimi için modal açma
  const openItemSelection = () => {
    setShowItemSelection(true);
  };

  // Ürün seçimini güncelleme
  const toggleItemSelection = (itemId: string) => {
    setSelectedItemsForPayment(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, selected: !item.selected, paymentQuantity: !item.selected ? 1 : 0 }
          : item
      )
    );
  };

  // Ödeme miktarını güncelleme
  const updatePaymentQuantity = (itemId: string, quantity: number) => {
    setSelectedItemsForPayment(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, paymentQuantity: Math.max(0, Math.min(quantity, item.quantity)) }
          : item
      )
    );
  };

  // Seçili ürünlerle ödeme ekleme
  const addPartialPaymentWithItems = (method: 'cash' | 'card') => {
    const selectedItems = selectedItemsForPayment.filter(item => item.selected && item.paymentQuantity > 0);
    
    if (selectedItems.length === 0) {
      alert('Lütfen ödenecek ürünleri seçin ve miktar belirleyin!');
      return;
    }
    
    const selectedAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.paymentQuantity), 0);
    
    if (selectedAmount > remainingAmount) {
      alert('Seçili ürünlerin toplamı kalan tutardan fazla!');
      return;
    }
    
    setSplitPayments([...splitPayments, { 
      method, 
      amount: selectedAmount, 
      items: selectedItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.paymentQuantity
      }))
    }]);
    
    setRemainingAmount(remainingAmount - selectedAmount);
    
    // Ödenen miktarları orijinal miktardan çıkar
    setSelectedItemsForPayment(prev => 
      prev.map(item => {
        if (item.selected && item.paymentQuantity > 0) {
          const newQuantity = item.quantity - item.paymentQuantity;
          return {
            ...item,
            quantity: newQuantity,
            selected: false,
            paymentQuantity: 0
          };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  // Kısmi ödeme ekleme (manuel tutar ile)
  const addPartialPayment = (method: 'cash' | 'card', amount: number) => {
    if (amount <= 0) {
      alert('Ödeme tutarı sıfırdan büyük olmalıdır!');
      return;
    }
    
    if (amount > remainingAmount) {
      alert('Ödeme tutarı kalan tutardan fazla olamaz!');
      return;
    }
    
    setSplitPayments([...splitPayments, { method, amount, items: [] }]);
    setRemainingAmount(remainingAmount - amount);
    setPartialPaymentAmount(0);
  };

  // Bölünen ödemeyi tamamla
  const completeSplitPayment = async () => {
    if (!selectedOrder || remainingAmount > 0) {
      alert('Tüm tutar ödenmelidir!');
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      // Sipariş durumunu "ödendi" olarak güncelle
      updateOrderStatus(selectedOrder.id, 'paid');
      
      // Her ödeme için kayıt oluştur
      splitPayments.forEach((payment, index) => {
        const paymentRecord = {
          orderId: selectedOrder.id,
          tableNumber: selectedOrder.tableNumber,
          amount: payment.amount,
          method: payment.method,
          tip: index === 0 ? tipAmount : 0, // Bahşiş sadece ilk ödemeye
          timestamp: new Date().toISOString(),
          cashier: 'MasApp',
          isSplit: true,
          splitIndex: index + 1,
          totalSplit: splitPayments.length
        };
        
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.push(paymentRecord);
        localStorage.setItem('payments', JSON.stringify(payments));
      });
      
      // Ödeme bildirimi oluştur
      createPaymentNotification(selectedOrder.id, `Bölünen Ödeme (${splitPayments.length} parça)`);
      
      setIsProcessing(false);
      setShowSplitPaymentModal(false);
      setSelectedOrder(null);
      setTipAmount(0);
      setSplitPayments([]);
      setRemainingAmount(0);
    }, 1000);
  };

  // Ödeme geçmişini yükle
  const loadPaymentHistory = () => {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    setPaymentHistory(payments);
    setShowPaymentHistory(true);
  };

  const handlePrintReceipt = (order: Order) => {
    const printContent = `
      <div style="font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px;">
        <h2 style="text-align: center; margin-bottom: 20px;">${restaurantName}</h2>
        <hr>
        <p><strong>Masa:</strong> ${order.tableNumber}</p>
        <p><strong>Tarih:</strong> ${new Date(order.timestamp).toLocaleString('tr-TR')}</p>
        <hr>
        ${order.items.map(item => `
          <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>${item.name.tr} x${item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}₺</span>
          </div>
        `).join('')}
        <hr>
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px;">
          <span>Toplam:</span>
          <span>${order.total.toFixed(2)}₺</span>
        </div>
        <hr>
        <p style="text-align: center; margin-top: 20px;">Teşekkürler!</p>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return incomingBillBlink && selectedOrder?.tableNumber === incomingBillBlink.table
          ? 'Hesap (Yeni)'
          : 'Beklemede';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      case 'delivered': return 'Servis Edildi';
      case 'paid': return 'Ödendi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <FaMoneyBillWave className="text-green-600" />;
      case 'card': return <FaCreditCard className="text-blue-600" />;
      case 'qr': return <FaQrcode className="text-purple-600" />;
      default: return <FaMoneyBillWave className="text-gray-600" />;
    }
  };

  const totalRevenue = demoOrders
    .filter(order => order.status === 'paid')
    .reduce((sum, order) => sum + order.total, 0);

  const pendingOrders = demoOrders.filter(order => order.status === 'ready').length;

  // Bildirimleri yükle
  useEffect(() => {
    const loadNotifications = () => {
      const activeNotifications = getActiveNotifications('cashier');
      setNotifications(activeNotifications);
      
      // Hesap taleplerini yükle
      const pendingRequests = getBillRequestsByStatus('pending');
      setBillRequests(pendingRequests);
    };
    
    loadNotifications();
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, [getActiveNotifications, getBillRequestsByStatus]);

  // Bildirimleri yükle ve masa değişikliği bildirimlerini kontrol et
  useEffect(() => {
    const savedNotifications = JSON.parse(localStorage.getItem('cashier_notifications') || '[]');
    setNotifications(prev => [...prev, ...savedNotifications]);
    
    // Demo veriler kaldırıldı - gerçek veriler API'den gelecek
    
    // Masa değişikliği bildirimlerini kontrol et
    const checkTableTransferNotifications = () => {
      const cashierNotifications = JSON.parse(localStorage.getItem('cashier_notifications') || '[]');
      const tableTransferNotif = cashierNotifications.find((notif: any) => 
        notif.type === 'table_transfer' && !notif.read
      );
      
      if (tableTransferNotif) {
        setTableTransferNotification(tableTransferNotif);
        setShowTableTransferNotification(true);
        
        // Bildirimi okundu olarak işaretle
        const updatedNotifications = cashierNotifications.map((notif: any) => 
          notif === tableTransferNotif ? { ...notif, read: true } : notif
        );
        localStorage.setItem('cashier_notifications', JSON.stringify(updatedNotifications));
      }
    };
    
    checkTableTransferNotifications();
    
    // Her 3 saniyede bir kontrol et
    const interval = setInterval(checkTableTransferNotifications, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Menü işlemleri
  const addMenuItem = (menuItem: MenuItem) => {
    const existingItem = currentOrderItems.find(item => item.id === menuItem.id);
    if (existingItem) {
      setCurrentOrderItems(prev => 
        prev.map(item => 
          item.id === menuItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCurrentOrderItems(prev => [...prev, {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
  };

  const removeMenuItem = (itemId: string) => {
    setCurrentOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeMenuItem(itemId);
    } else {
      setCurrentOrderItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const createNewOrder = () => {
    if (currentOrderItems.length === 0) return;
    
    const total = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      tableNumber: selectedTable,
      items: currentOrderItems.map(item => ({
        id: item.id,
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: '',
        notes: ''
      })),
      total,
      subtotal: total,
      tipAmount: 0,
      supportAmount: 0,
      discount: 0,
      status: 'pending',
      timestamp: Date.now(),
      couponCode: null
    };
    
    // Store'a ekle
    const { addOrder } = useOrderStore.getState();
    addOrder(newOrder);
    
    // Local state'i temizle
    setCurrentOrderItems([]);
    setShowMenu(false);
  };

  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered');
  };

  // Sipariş düzenleme fonksiyonları
  const startEditingOrder = (order: Order) => {
    setEditingOrder(order);
    setCurrentOrderItems(order.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })));
    setSelectedTable(order.tableNumber);
    setShowEditModal(true);
  };

  const removeItemFromOrder = (orderId: string, itemId: string) => {
    const order = demoOrders.find(o => o.id === orderId);
    if (!order) return;

    const updatedItems = order.items.filter(item => item.id !== itemId);
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Store'u güncelle
    updateCentralOrderStatus(orderId, 'pending');
    console.log('Ürün siparişten çıkarıldı:', itemId);

    // Mutfak için değişiklik bildirimi
    sendKitchenChangeNotification(order.tableNumber, orderId, 'Kasa siparişi düzenledi');
  };

  const updateOrderItems = (orderId: string, newItems: typeof currentOrderItems) => {
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Store'u güncelle
    console.log('Sipariş güncellendi:', orderId, newItems, newTotal);
    setShowEditModal(false);
    setEditingOrder(null);
    setCurrentOrderItems([]);

    // Mutfak için değişiklik bildirimi
    const order = demoOrders.find(o => o.id === orderId);
    if (order) {
      sendKitchenChangeNotification(order.tableNumber, orderId, 'Siparişte değişiklik yapıldı');
    }
  };

  // Ödeme bildirimi (hem QR hem kasa ödemesi için)
  // Hesap talebi işleme
  const processBillRequest = (billRequestId: string) => {
    const billRequest = getBillRequestsByStatus('pending').find(req => req.id === billRequestId);
    if (!billRequest) return;
    
    // Siparişi bul
    const order = demoOrders.find(o => o.id === billRequest.orderId);
    if (!order) return;
    
    // Fatura oluştur
    const billId = generateBill(billRequestId, order.items, 0.18, 0);
    
    // Bildirim oluştur
    createBillReadyNotification(
      billRequest.tableNumber,
      billRequest.orderId,
      billRequestId
    );
    
    // Durumu güncelle
    updateBillRequestStatus(billRequestId, 'ready', user?.id);
    
    console.log('✅ Fatura oluşturuldu:', billId);
  };

  const createPaymentNotification = (orderId: string, paymentMethod: string = 'QR') => {
    const order = demoOrders.find(o => o.id === orderId);
    if (order) {
      const paymentNotification = {
        type: 'payment_completed',
        orderId: orderId,
        tableNumber: order.tableNumber,
        amount: order.total,
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString(),
        message: `Masa ${order.tableNumber} ${paymentMethod} ödemesi tamamlandı - ${order.total.toFixed(2)}₺`
      };
      
      // Bildirimleri local storage'a kaydet
      const notifications = JSON.parse(localStorage.getItem('cashier_notifications') || '[]');
      notifications.push(paymentNotification);
      localStorage.setItem('cashier_notifications', JSON.stringify(notifications));
      
      // State'i güncelle
      setNotifications(prev => [...prev, paymentNotification]);
      
      // Bildirim store'una da ekle
      createPaymentCompletedNotification(order.tableNumber, orderId, order.total);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('cashier_notifications', JSON.stringify([]));
  };

  // Mutfak değişiklik bildirimi yayınla
  const sendKitchenChangeNotification = (tableNumber: number, orderId: string, message: string) => {
    try {
      publish('kitchen_order_changed', { tableNumber, orderId, message, timestamp: Date.now() });
      // Ayrıca localStorage ile mutfak sayfasının okuyabileceği bir kuyrukta tutalım (demo)
      const arr = JSON.parse(localStorage.getItem('kitchen_change_notifications') || '[]');
      arr.push({ tableNumber, orderId, message, timestamp: Date.now(), read: false });
      localStorage.setItem('kitchen_change_notifications', JSON.stringify(arr));
    } catch {}
  };

  // Menü filtreleme
  const getFilteredMenuItems = () => {
    let filtered = menuData;
    
    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Arama filtresi
    if (menuSearchTerm) {
      filtered = filtered.filter(item => 
        item.name.tr.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
        item.name.en.toLowerCase().includes(menuSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'starters': 'Başlangıçlar',
      'mains': 'Ana Yemekler',
      'meats': 'Et Yemekleri',
      'chicken': 'Tavuk Yemekleri',
      'pasta': 'Makarnalar',
      'seafood': 'Deniz Ürünleri',
      'desserts': 'Tatlılar',
      'drinks': 'İçecekler'
    };
    return categoryNames[category] || category;
  };

  const getUniqueCategories = () => {
    const categories = Array.from(new Set(menuData.map(item => item.category)));
    return categories;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{restaurantName} - Kasa Paneli</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Ödemeleri yönet ve kasa işlemlerini takip et</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => {
                  logout();
                  router.push('/business/login');
                }}
                className="px-2 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <FaSignOutAlt className="text-sm sm:text-base" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6">

        {/* İstatistikler */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <FaReceipt className="text-green-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Toplam Ciro</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)}₺</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <FaClock className="text-yellow-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <FaUtensils className="text-blue-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Toplam</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{demoOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <FaCheck className="text-purple-600 text-lg sm:text-xl" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Tamamlanan</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {demoOrders.filter(order => order.status === 'paid').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menü Bölümü */}
        {showMenu && (
          <div className="bg-white rounded-lg shadow mb-4 sm:mb-6 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Menüden Sipariş Ekle</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Masa:</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(Number(e.target.value))}
                    className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {Array.from({ length: 20 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Masa {i + 1}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={createNewOrder}
                  disabled={currentOrderItems.length === 0}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FaPlus className="text-sm" />
                  <span className="hidden sm:inline">Sipariş Oluştur</span>
                  <span className="sm:hidden">Oluştur</span>
                </button>
              </div>
            </div>

            {/* Sepet */}
            {currentOrderItems.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sepet ({currentOrderItems.length} ürün)</h3>
                <div className="space-y-2">
                  {currentOrderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name.tr}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                        <span className="font-semibold text-gray-900 w-20 text-right">
                          {(item.price * item.quantity).toFixed(2)}₺
                        </span>
                        <button
                          onClick={() => removeMenuItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Toplam:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}₺
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Menü Kategorileri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {['starters', 'mains', 'meats', 'chicken', 'pasta', 'seafood', 'desserts', 'drinks'].map((category) => {
                const categoryItems = menuData.filter(item => item.category === category);
                if (categoryItems.length === 0) return null;
                
                return (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                      {category === 'starters' ? 'Başlangıçlar' :
                       category === 'mains' ? 'Ana Yemekler' :
                       category === 'meats' ? 'Et Yemekleri' :
                       category === 'chicken' ? 'Tavuk Yemekleri' :
                       category === 'pasta' ? 'Makarnalar' :
                       category === 'seafood' ? 'Deniz Ürünleri' :
                       category === 'desserts' ? 'Tatlılar' :
                       category === 'drinks' ? 'İçecekler' : category}
                    </h3>
                    <div className="space-y-2">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name.tr}</h4>
                            <p className="text-sm text-gray-600">{item.price}₺</p>
                          </div>
                          <button
                            onClick={() => addMenuItem(item)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Arama ve Filtreler */}
        <div className="bg-white rounded-lg shadow mb-4 sm:mb-6 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Masa veya ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Hazırlanıyor</option>
                <option value="ready">Hazır</option>
                <option value="delivered">Servis Edildi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sipariş Listesi */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Siparişler</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {sortedOrders.map((order) => (
              <div key={order.id} className="p-3 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Masa {order.tableNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} ${incomingBillBlink && order.tableNumber === incomingBillBlink.table ? 'animate-pulse ring-2 ring-red-400' : ''}`}>
                        {getStatusText(order.status)}
                      </span>
                      {/* Hesap talebi bildirimi */}
                      {billRequests.some(request => request.tableNumber === order.tableNumber) && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 animate-pulse">
                          <FaReceipt className="inline mr-1" />
                          Hesap Talebi
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Sipariş Detayları:</p>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name.tr} x{item.quantity}</span>
                              <span>{(item.price * item.quantity).toFixed(2)}₺</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Sipariş Bilgileri:</p>
                        <p className="text-sm text-gray-900">Sipariş No: {order.id}</p>
                        <p className="text-sm text-gray-900">Tarih: {new Date(order.timestamp).toLocaleString('tr-TR')}</p>
                        <p className="text-sm font-semibold text-gray-900">Toplam: {order.total.toFixed(2)}₺</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {/* Ödeme Al (durum/hesap talebine göre) */}
                    {(order.status === 'ready' || order.status === 'delivered' || (order.status === 'pending' && billRequests.some(request => request.tableNumber === order.tableNumber))) && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowPaymentModal(true);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <FaCreditCard />
                          Ödeme Al
                        </button>
                      </>
                    )}

                    {/* Siparişi Düzenle: her zaman göster */}
                    <button
                      onClick={() => startEditingOrder(order)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FaPlus />
                      Siparişi Düzenle
                    </button>
                    
                    {/* Ödenen Siparişler - Ödendi Butonu (Fiş Yazdır) */}
                    {order.status === 'paid' && (
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <FaCheck />
                        Ödendi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

       {/* Ödeme Modal */}
       {showPaymentModal && selectedOrder && (
         <div 
           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
           onClick={() => setShowPaymentModal(false)}
         >
           <div 
             className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="p-6 border-b border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900">Ödeme Al</h3>
               <p className="text-sm text-gray-600">Masa {selectedOrder.tableNumber} - {selectedOrder.total.toFixed(2)}₺</p>
             </div>
             
             <div className="p-6">
               {!paymentType ? (
                 // Ödeme türü seçimi
                 <div className="space-y-4">
                   <h4 className="text-md font-semibold text-gray-900 mb-4">Ödeme Türünü Seçin</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <button
                       onClick={() => handlePaymentTypeSelection('single')}
                       className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center gap-3"
                     >
                       <FaCreditCard className="text-2xl text-gray-600" />
                       <span className="font-medium text-gray-900">Tek Ödeme</span>
                       <span className="text-sm text-gray-600">Tüm tutarı tek seferde öde</span>
                     </button>
                     <button
                       onClick={() => handlePaymentTypeSelection('split')}
                       className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center gap-3"
                     >
                       <FaMoneyBillWave className="text-2xl text-gray-600" />
                       <span className="font-medium text-gray-900">Bölünen Ödeme</span>
                       <span className="text-sm text-gray-600">Ürünleri seçerek öde</span>
                     </button>
                   </div>
                 </div>
               ) : paymentType === 'single' ? (
                 // Tek ödeme - Ödeme yöntemi seçimi
                 <div className="space-y-6">
                   <h4 className="text-md font-semibold text-gray-900 mb-4">Ödeme Yöntemini Seçin</h4>
                   <div className="grid grid-cols-2 gap-4">
                     {[
                       { id: 'cash', label: 'Nakit', icon: <FaMoneyBillWave className="text-2xl" /> },
                       { id: 'card', label: 'Kart', icon: <FaCreditCard className="text-2xl" /> }
                     ].map((method) => (
                       <button
                         key={method.id}
                         onClick={() => setPaymentMethod(method.id as any)}
                         className={`p-6 rounded-lg border-2 flex flex-col items-center gap-3 transition-colors ${
                           paymentMethod === method.id
                             ? 'border-blue-500 bg-blue-50 text-blue-700'
                             : 'border-gray-200 hover:border-gray-300'
                         }`}
                       >
                         {method.icon}
                         <span className="font-medium">{method.label}</span>
                       </button>
                     ))}
                   </div>
                   
                   {/* Toplam */}
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex justify-between text-lg font-semibold text-gray-900">
                       <span>Toplam:</span>
                       <span>{selectedOrder.total.toFixed(2)}₺</span>
                     </div>
                   </div>
                   
                   {/* Ödeme Butonu */}
                   <button
                     onClick={handlePayment}
                     disabled={isProcessing}
                     className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                   >
                     {isProcessing ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                         İşleniyor...
                       </>
                     ) : (
                       <>
                         <FaCreditCard />
                         Ödemeyi Al
                       </>
                     )}
                   </button>
                 </div>
               ) : (
                 // Bölünen ödeme - Ürün seçimi
                 <div className="space-y-4">
                   <h4 className="text-md font-semibold text-gray-900">Ödenecek Ürünleri ve Miktarları Seçin</h4>
                   
                   <div className="space-y-3">
                     {selectedItemsForPayment.map((item) => (
                       <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                         <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-3">
                             <input
                               type="checkbox"
                               checked={item.selected}
                               onChange={() => toggleItemSelection(item.id)}
                               className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                             />
                             <div>
                               <span className="font-medium text-gray-900">{item.name.tr}</span>
                               <span className="text-sm text-gray-600 ml-2">(Mevcut: {item.quantity} adet)</span>
                             </div>
                           </div>
                           <span className="font-semibold text-gray-900">
                             {item.price}₺/adet
                           </span>
                         </div>
                         
                         {item.selected && (
                           <div className="flex items-center gap-3">
                             <span className="text-sm text-gray-600">Ödenecek miktar:</span>
                             <div className="flex items-center gap-2">
                               <button
                                 onClick={() => updatePaymentQuantity(item.id, item.paymentQuantity - 1)}
                                 disabled={item.paymentQuantity <= 0}
                                 className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                 <FaMinus className="text-xs" />
                               </button>
                               <span className="w-12 text-center font-medium">{item.paymentQuantity}</span>
                               <button
                                 onClick={() => updatePaymentQuantity(item.id, item.paymentQuantity + 1)}
                                 disabled={item.paymentQuantity >= item.quantity}
                                 className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                 <FaPlus className="text-xs" />
                               </button>
                             </div>
                             <span className="text-sm font-semibold text-gray-900 ml-auto">
                               = {(item.price * item.paymentQuantity).toFixed(2)}₺
                             </span>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                   
                   {/* Seçili ürünlerin toplamı */}
                   {selectedItemsForPayment.filter(item => item.selected && item.paymentQuantity > 0).length > 0 && (
                     <div className="bg-blue-50 rounded-lg p-4">
                       <div className="flex justify-between items-center">
                         <span className="font-medium text-blue-900">Seçili Ürünlerin Toplamı:</span>
                         <span className="text-xl font-bold text-blue-900">
                           {selectedItemsForPayment
                             .filter(item => item.selected && item.paymentQuantity > 0)
                             .reduce((sum, item) => sum + (item.price * item.paymentQuantity), 0)
                             .toFixed(2)}₺
                         </span>
                       </div>
                     </div>
                   )}
                   
                   {/* Ödeme butonları */}
                   <div className="grid grid-cols-2 gap-3">
                     <button
                       onClick={() => addPartialPaymentWithItems('cash')}
                       disabled={selectedItemsForPayment.filter(item => item.selected && item.paymentQuantity > 0).length === 0}
                       className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     >
                       <FaMoneyBillWave />
                       Nakit
                     </button>
                     <button
                       onClick={() => addPartialPaymentWithItems('card')}
                       disabled={selectedItemsForPayment.filter(item => item.selected && item.paymentQuantity > 0).length === 0}
                       className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     >
                       <FaCreditCard />
                       Kart
                     </button>
                   </div>
                 </div>
               )}
             </div>
             
             <div className="p-6 border-t border-gray-200 flex gap-3">
               <button
                 onClick={() => {
                   setShowPaymentModal(false);
                   setPaymentType(null);
                 }}
                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 İptal
               </button>
               {paymentType && (
                 <button
                   onClick={() => setPaymentType(null)}
                   className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                 >
                   Geri
                 </button>
               )}
             </div>
           </div>
         </div>
       )}


      {/* Ödeme Geçmişi Modal */}
      {showPaymentHistory && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaymentHistory(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Ödeme Geçmişi</h3>
              <button
                onClick={() => setShowPaymentHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              {paymentHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FaReceipt className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>Henüz ödeme kaydı yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            Masa {payment.tableNumber} - Sipariş #{payment.orderId}
                          </span>
                          {payment.isSplit && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Bölünen ({payment.splitIndex}/{payment.totalSplit})
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(payment.timestamp).toLocaleString('tr-TR')} - 
                          {payment.method === 'cash' ? 'Nakit' : 'Kart'} - 
                          {payment.cashier}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{payment.amount.toFixed(2)}₺</div>
                        {payment.tip > 0 && (
                          <div className="text-sm text-gray-600">+{payment.tip.toFixed(2)}₺ bahşiş</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
       )}

       {/* Ürün Seçimi Modal */}
       {showItemSelection && selectedOrder && (
         <div 
           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
           onClick={() => setShowItemSelection(false)}
         >
           <div 
             className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="p-6 border-b border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900">Ödenecek Ürünleri Seçin</h3>
               <p className="text-sm text-gray-600">Masa {selectedOrder.tableNumber} - Hangi ürünleri ödemek istiyorsunuz?</p>
             </div>
             
             <div className="p-6">
               <div className="space-y-3">
                 {selectedItemsForPayment.map((item) => (
                   <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                     <div className="flex items-center gap-3">
                       <input
                         type="checkbox"
                         checked={item.selected}
                         onChange={() => toggleItemSelection(item.id)}
                         className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                       />
                       <div className="flex-1">
                         <h4 className="font-medium text-gray-900">{item.name.tr}</h4>
                         <p className="text-sm text-gray-600">Miktar: {item.quantity} - Birim Fiyat: {item.price}₺</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className="font-semibold text-gray-900">
                         {(item.price * item.quantity).toFixed(2)}₺
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
               
               {/* Seçili Ürünlerin Toplamı */}
               {selectedItemsForPayment.filter(item => item.selected).length > 0 && (
                 <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                   <div className="flex justify-between items-center">
                     <span className="font-medium text-blue-900">Seçili Ürünlerin Toplamı:</span>
                     <span className="text-xl font-bold text-blue-900">
                       {selectedItemsForPayment
                         .filter(item => item.selected)
                         .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                         .toFixed(2)}₺
                     </span>
                   </div>
                 </div>
               )}
             </div>
             
             <div className="p-6 border-t border-gray-200 flex gap-3">
               <button
                 onClick={() => setShowItemSelection(false)}
                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 İptal
               </button>
               <button
                 onClick={() => setShowItemSelection(false)}
                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 Seçimi Tamamla
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Sipariş Düzenleme Modal */}
      {showEditModal && editingOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sipariş Düzenle</h3>
                <p className="text-sm text-gray-600">Masa {editingOrder.tableNumber} - Sipariş #{editingOrder.id}</p>
              </div>
              <button
                onClick={() => cancelOrder(editingOrder.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Siparişi İptal Et
              </button>
            </div>
            
            <div className="p-6">
              {/* Mevcut Ürünler */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Ürünleri</h4>
                <div className="space-y-3">
                  {currentOrderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.name.tr}</h5>
                        <p className="text-sm text-gray-600">{item.price}₺</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                        <span className="font-semibold text-gray-900 w-20 text-right">
                          {(item.price * item.quantity).toFixed(2)}₺
                        </span>
                        <button
                          onClick={() => removeMenuItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {currentOrderItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Siparişte ürün kalmadı. Sipariş otomatik olarak iptal edilecek.</p>
                  </div>
                )}
              </div>

              {/* Yeni Ürün Ekleme */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Yeni Ürün Ekle</h4>
                </div>
                
                {/* Arama ve Kategori Filtreleri */}
                <div className="mb-4 space-y-3">
                  {/* Arama */}
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ürün ara..."
                      value={menuSearchTerm}
                      onChange={(e) => setMenuSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Kategori Butonları */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Tümü
                    </button>
                    {getUniqueCategories().map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getCategoryName(category)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ürün Listesi */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {getFilteredMenuItems().map((menuItem) => (
                    <button
                      key={menuItem.id}
                      onClick={() => addMenuItem(menuItem)}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{menuItem.name.tr}</p>
                        <p className="text-sm text-gray-600">{menuItem.price}₺</p>
                      </div>
                      <FaPlus className="text-green-600" />
                    </button>
                  ))}
                  
                  {getFilteredMenuItems().length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <p>Arama kriterlerinize uygun ürün bulunamadı</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Toplam */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Yeni Toplam:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}₺
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOrder(null);
                  setCurrentOrderItems([]);
                  setMenuSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => updateOrderItems(editingOrder.id, currentOrderItems)}
                disabled={currentOrderItems.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Masa Değişikliği Bildirimi */}
      {showTableTransferNotification && tableTransferNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaUtensils className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Masa Değişikliği</h3>
                  <p className="text-sm text-gray-600">Sipariş taşındı</p>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-orange-800 font-medium">
                  Sipariş #{tableTransferNotification.orderId}
                </p>
                <p className="text-orange-700 text-sm">
                  {tableTransferNotification.oldTableNumber} → {tableTransferNotification.newTableNumber} numaralı masa
                </p>
                <p className="text-orange-600 text-xs mt-1">
                  {new Date(tableTransferNotification.timestamp).toLocaleString('tr-TR')}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTableTransferNotification(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Tamam
                </button>
                <button
                  onClick={() => {
                    setShowTableTransferNotification(false);
                    // Siparişi yeni masada göster
                    setSelectedTable(tableTransferNotification.newTableNumber);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Yeni Masayı Görüntüle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}