const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Database connection
const { connectDB } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Allow specific origins for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin === 'http://localhost:3000') return callback(null, true);
    
    // Allow main domain
    if (origin === 'https://restxqr.com' || origin === 'https://www.restxqr.com') {
      return callback(null, true);
    }
    
    // Allow all subdomains of restxqr.com
    if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.restxqr\.com$/)) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Subdomain', 'X-Forwarded-Host'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static dosya servisi (uploads klasörü için)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rate limiting - GEVŞEK (Development için)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1 dakikada 1000 istek (çok gevşek)
  message: 'Çok fazla istek gönderdiniz, lütfen biraz bekleyin'
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'restXqr Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes (placeholder)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/restaurants', require('./routes/menu')); // Menu routes nested under restaurants
app.use('/api/orders', require('./routes/orders'));
app.use('/api/qr', require('./routes/qr')); // QR code management
app.use('/api/staff', require('./routes/staff')); // Staff management
app.use('/api/admin', require('./routes/admin-seed')); // Admin seed routes

// Comprehensive debug endpoint
app.get('/debug-full', async (req, res) => {
  try {
    const { sequelize, Staff, Restaurant, MenuCategory, MenuItem, Order, OrderItem, QRToken, Feature } = require('./models');
    
    // Database connection status
    let dbStatus = 'disconnected';
    let dbUrl = 'Not set';
    try {
      await sequelize.authenticate();
      dbStatus = 'connected';
      dbUrl = process.env.DATABASE_URL ? 'Set' : 'Not set';
    } catch (err) {
      dbStatus = `error: ${err.message}`;
    }
    
    // Check tables existence
    const tableChecks = {};
    const models = { Staff, Restaurant, MenuCategory, MenuItem, Order, OrderItem, QRToken, Feature };
    
    for (const [modelName, model] of Object.entries(models)) {
      try {
        await model.count();
        tableChecks[modelName] = 'OK';
      } catch (err) {
        tableChecks[modelName] = `Error: ${err.message}`;
      }
    }
    
    // Get user statistics
    let userStats = {
      totalUsers: 0,
      totalRestaurants: 0,
      activeUsers: 0,
      adminUsers: 0
    };
    
    let userList = [];
    
    try {
      const staff = await Staff.findAll({
        order: [['createdAt', 'DESC']]
      });
      
      userStats.totalUsers = staff.length;
      userStats.activeUsers = staff.filter(s => s.status === 'active').length;
      userStats.adminUsers = staff.filter(s => s.role === 'admin').length;
      
      userList = staff.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        status: member.status,
        restaurantId: member.restaurantId || '-',
        createdAt: member.createdAt?.toLocaleDateString('tr-TR') || 'N/A'
      }));
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
    
    try {
      const restaurants = await Restaurant.findAll();
      userStats.totalRestaurants = restaurants.length;
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    }
    
    // HTML response for debug page
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🔍 Debug - Kullanıcı Kontrolü</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .header { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background: #f8f9fa; }
            .error { color: #dc3545; }
            .success { color: #28a745; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat-card { background: #007bff; color: white; padding: 15px; border-radius: 5px; text-align: center; flex: 1; }
            .refresh-btn { background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="header">🔍 Debug - Kullanıcı Kontrolü</h1>
            
            <div class="section">
                <h2>📊 Veritabanı Tabloları</h2>
                <table class="table">
                    ${Object.entries(tableChecks).map(([table, status]) => `
                        <tr>
                            <td><strong>${table}</strong></td>
                            <td class="${status === 'OK' ? 'success' : 'error'}">${status}</td>
                        </tr>
                    `).join('')}
                </table>
                <p><strong>Database URL:</strong> ${dbUrl}</p>
                <p><strong>Node Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            </div>
            
            <div class="section">
                <h2>📈 Özet İstatistikler</h2>
                <div class="stats">
                    <div class="stat-card">
                        <h3>${userStats.totalUsers}</h3>
                        <p>Toplam Kullanıcı</p>
                    </div>
                    <div class="stat-card">
                        <h3>${userStats.totalRestaurants}</h3>
                        <p>Toplam Restoran</p>
                    </div>
                    <div class="stat-card">
                        <h3>${userStats.activeUsers}</h3>
                        <p>Aktif Kullanıcı</p>
                    </div>
                    <div class="stat-card">
                        <h3>${userStats.adminUsers}</h3>
                        <p>Admin Kullanıcı</p>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>👥 Kullanıcı Listesi</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ad</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Durum</th>
                            <th>Restoran</th>
                            <th>Oluşturulma</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userList.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.role}</td>
                                <td>${user.status}</td>
                                <td>${user.restaurantId}</td>
                                <td>${user.createdAt}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <button class="refresh-btn" onclick="location.reload()">🔄 Verileri Yenile</button>
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(html);
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint error',
      error: error.message
    });
  }
});

// Comprehensive system debug endpoint
app.get('/debug-system', async (req, res) => {
  try {
    const { sequelize, Staff, Restaurant, MenuCategory, MenuItem, Order, OrderItem, QRToken, Feature } = require('./models');
    
    // Get all data with relationships
    const restaurants = await Restaurant.findAll({
      include: [
        { model: Staff, as: 'staff' },
        { model: MenuCategory, as: 'categories', include: [{ model: MenuItem, as: 'items' }] },
        { model: Order, as: 'orders', include: [{ model: OrderItem, as: 'items' }] },
        { model: QRToken, as: 'qrTokens' }
      ]
    });

    const allStaff = await Staff.findAll({ include: [{ model: Restaurant, as: 'restaurant' }] });
    const allMenuItems = await MenuItem.findAll({ 
      include: [
        { model: Restaurant, as: 'restaurant' },
        { model: MenuCategory, as: 'category' }
      ]
    });
    const allOrders = await Order.findAll({ include: [{ model: OrderItem, as: 'items' }] });

    // Statistics
    const stats = {
      totalRestaurants: restaurants.length,
      totalStaff: allStaff.length,
      totalMenuItems: allMenuItems.length,
      totalOrders: allOrders.length,
      activeStaff: allStaff.filter(s => s.status === 'active').length,
      adminStaff: allStaff.filter(s => s.role === 'admin').length
    };

    // HTML Response with beautiful design
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🔍 Sistem Debug Paneli</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; background: #f8f9fa; }
            .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            .stat-number { font-size: 2.5em; font-weight: bold; color: #667eea; margin-bottom: 10px; }
            .stat-label { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
            .section { background: white; margin-bottom: 30px; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .section-header { background: #667eea; color: white; padding: 20px; font-size: 1.2em; font-weight: bold; }
            .section-content { padding: 20px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            .table th { background: #f8f9fa; font-weight: 600; }
            .table tr:hover { background: #f8f9fa; }
            .badge { padding: 4px 8px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
            .badge-success { background: #d4edda; color: #155724; }
            .badge-warning { background: #fff3cd; color: #856404; }
            .badge-danger { background: #f8d7da; color: #721c24; }
            .badge-info { background: #d1ecf1; color: #0c5460; }
            .restaurant-card { border: 1px solid #eee; margin-bottom: 20px; border-radius: 8px; overflow: hidden; }
            .restaurant-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #eee; }
            .restaurant-content { padding: 15px; }
            .staff-list, .menu-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px; }
            .staff-item, .menu-item { background: #f8f9fa; padding: 10px; border-radius: 5px; border-left: 4px solid #667eea; }
            .refresh-btn { background: #28a745; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; margin: 20px 0; }
            .refresh-btn:hover { background: #218838; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔍 RestXqr Sistem Debug Paneli</h1>
                <p>Tüm sistem bilgileri ve istatistikleri</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalRestaurants}</div>
                    <div class="stat-label">Toplam Restoran</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalStaff}</div>
                    <div class="stat-label">Toplam Personel</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalMenuItems}</div>
                    <div class="stat-label">Toplam Ürün</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalOrders}</div>
                    <div class="stat-label">Toplam Sipariş</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.activeStaff}</div>
                    <div class="stat-label">Aktif Personel</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.adminStaff}</div>
                    <div class="stat-label">Admin Kullanıcı</div>
                </div>
            </div>

            <div class="section">
                <div class="section-header">🏪 Restoranlar ve Detayları</div>
                <div class="section-content">
                    ${restaurants.map(restaurant => `
                        <div class="restaurant-card">
                            <div class="restaurant-header">
                                <h3>${restaurant.name} (@${restaurant.username})</h3>
                                <p><strong>Email:</strong> ${restaurant.email}</p>
                                <p><strong>ID:</strong> ${restaurant.id}</p>
                            </div>
                            <div class="restaurant-content">
                                <h4>👥 Personeller (${restaurant.staff?.length || 0})</h4>
                                <div class="staff-list">
                                    ${restaurant.staff?.map(staff => `
                                        <div class="staff-item">
                                            <strong>${staff.name}</strong><br>
                                            <small>${staff.email}</small><br>
                                            <span class="badge ${staff.role === 'admin' ? 'badge-danger' : staff.role === 'chef' ? 'badge-warning' : 'badge-info'}">${staff.role}</span>
                                            <span class="badge ${staff.status === 'active' ? 'badge-success' : 'badge-danger'}">${staff.status}</span>
                                        </div>
                                    `).join('') || '<p>Personel bulunamadı</p>'}
                                </div>

                                <h4>🍽️ Menü Kategorileri (${restaurant.categories?.length || 0})</h4>
                                ${restaurant.categories?.map(category => `
                                    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                                        <h5>${category.name} (${category.items?.length || 0} ürün)</h5>
                                        <div class="menu-list">
                                            ${category.items?.map(item => `
                                                <div class="menu-item">
                                                    <strong>${item.name}</strong><br>
                                                    <small>${item.price} TL</small><br>
                                                    ${item.description ? `<small>${item.description.substring(0, 50)}...</small>` : ''}
                                                </div>
                                            `).join('') || '<p>Ürün bulunamadı</p>'}
                                        </div>
                                    </div>
                                `).join('') || '<p>Kategori bulunamadı</p>'}

                                <h4>📱 QR Tokenları (${restaurant.qrTokens?.length || 0})</h4>
                                <div class="staff-list">
                                    ${restaurant.qrTokens?.map(token => `
                                        <div class="staff-item">
                                            <strong>Masa ${token.tableNumber || 'N/A'}</strong><br>
                                            <small>Token: ${token.token?.substring(0, 20)}...</small><br>
                                            <span class="badge ${token.isActive ? 'badge-success' : 'badge-danger'}">${token.isActive ? 'Aktif' : 'Pasif'}</span>
                                        </div>
                                    `).join('') || '<p>QR token bulunamadı</p>'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <div class="section-header">👥 Tüm Personeller</div>
                <div class="section-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Durum</th>
                                <th>Restoran</th>
                                <th>Oluşturulma</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allStaff.map(staff => `
                                <tr>
                                    <td>${staff.name}</td>
                                    <td>${staff.email}</td>
                                    <td><span class="badge ${staff.role === 'admin' ? 'badge-danger' : staff.role === 'chef' ? 'badge-warning' : 'badge-info'}">${staff.role}</span></td>
                                    <td><span class="badge ${staff.status === 'active' ? 'badge-success' : 'badge-danger'}">${staff.status}</span></td>
                                    <td>${staff.restaurant?.name || 'N/A'}</td>
                                    <td>${staff.createdAt?.toLocaleDateString('tr-TR') || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="section">
                <div class="section-header">🍽️ Tüm Menü Ürünleri</div>
                <div class="section-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Ürün Adı</th>
                                <th>Fiyat</th>
                                <th>Kategori</th>
                                <th>Restoran</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allMenuItems.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.price} TL</td>
                                    <td>${item.category?.name || 'N/A'}</td>
                                    <td>${item.restaurant?.name || 'N/A'}</td>
                                    <td><span class="badge ${item.isAvailable ? 'badge-success' : 'badge-danger'}">${item.isAvailable ? 'Mevcut' : 'Tükendi'}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <button class="refresh-btn" onclick="location.reload()">🔄 Verileri Yenile</button>
        </div>
    </body>
    </html>
    `;
    
    res.send(html);
    
  } catch (error) {
    console.error('Debug system error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug system error',
      error: error.message
    });
  }
});

// Database initialization endpoint (for fixing table issues)
app.post('/api/init-database', async (req, res) => {
  try {
    console.log('🔧 Database initialization requested...');
    const { sequelize } = require('./models');
    
    // Force sync all models (this will create missing tables)
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database tables synchronized');
    
    // Verify tables exist
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📊 Available tables after sync:', tables);
    
    res.json({
      success: true,
      message: 'Database initialized successfully',
      tables: tables
    });
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Database initialization failed',
      error: error.message
    });
  }
});

// File upload routes - Gerçek dosya yükleme sistemi
const multer = require('multer');
const sharp = require('sharp');

// Upload klasörünü oluştur
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'), false);
    }
  }
});

// Static dosya servisi (uploads klasörü için)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Gerçek upload endpoint
app.post('/api/upload/image', upload.single('image'), async (req, res) => {
  console.log('📤 Upload endpoint çağrıldı');
  
  try {
    if (!req.file) {
      console.log('❌ Dosya bulunamadı');
      return res.status(400).json({
        success: false,
        message: 'Resim dosyası bulunamadı'
      });
    }

    console.log('✅ Dosya alındı:', req.file.originalname, req.file.size, 'bytes');

    // Dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `image-${uniqueSuffix}.jpg`;
    const filePath = path.join(uploadDir, filename);

    console.log('📁 Dosya yolu:', filePath);

    // Sharp ile resmi optimize et ve kaydet
    try {
      await sharp(req.file.buffer)
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 80 })
        .toFile(filePath);

      console.log('✅ Resim Sharp ile işlendi ve kaydedildi');
    } catch (sharpError) {
      console.error('❌ Sharp hatası:', sharpError);
      
      // Sharp çalışmazsa basit dosya kaydetme
      console.log('🔄 Sharp çalışmadı, basit dosya kaydediliyor...');
      fs.writeFileSync(filePath, req.file.buffer);
      console.log('✅ Resim basit yöntemle kaydedildi');
    }

    // URL oluştur
    const imageUrl = `/uploads/${filename}`;

    console.log('🔗 URL oluşturuldu:', imageUrl);

    res.json({
      success: true,
      data: {
        filename: filename,
        originalName: req.file.originalname,
        size: req.file.size,
        imageUrl: imageUrl
      }
    });

  } catch (error) {
    console.error('❌ Resim yükleme hatası:', error);
    
    res.status(500).json({
      success: false,
      message: 'Resim yükleme hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Test endpoint for QR system
app.get('/api/qr/test', async (req, res) => {
  try {
    const { QRToken, Restaurant } = require('./models');
    
    // Test if QRToken model is available
    if (!QRToken) {
      return res.status(503).json({
        success: false,
        message: 'QRToken model not available'
      });
    }
    
    // Test database connection
    const count = await QRToken.count();
    
    res.json({
      success: true,
      message: 'QR system is working',
      qrTokenCount: count,
      models: {
        QRToken: !!QRToken,
        Restaurant: !!Restaurant
      }
    });
  } catch (error) {
    console.error('QR test error:', error);
    res.status(500).json({
      success: false,
      message: 'QR system error',
      error: error.message
    });
  }
});

// Test endpoint for debug page
app.post('/api/test-image', async (req, res) => {
  try {
    const { image, testData } = req.body;
    
    console.log('Test image endpoint called:', {
      imageLength: image?.length || 0,
      testData: testData
    });
    
    res.json({
      success: true,
      message: 'Test endpoint working',
      receivedData: {
        imageLength: image?.length || 0,
        imageType: image?.substring(0, 50) + '...',
        testData: testData
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint error',
      error: error.message
    });
  }
});

// Simple menu item test endpoint
app.post('/api/test-menu-item', async (req, res) => {
  try {
    const { restaurantId, categoryId, name, price, imageUrl } = req.body;
    
    console.log('Test menu item endpoint called:', {
      restaurantId,
      categoryId,
      name,
      price,
      imageUrlLength: imageUrl?.length || 0
    });
    
    // Just validate the data without creating
    if (!restaurantId || !categoryId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['restaurantId', 'categoryId', 'name', 'price']
      });
    }
    
    res.json({
      success: true,
      message: 'Menu item data is valid',
      data: {
        restaurantId,
        categoryId,
        name,
        price,
        imageUrlLength: imageUrl?.length || 0
      }
    });
  } catch (error) {
    console.error('Test menu item endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test menu item endpoint error',
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Initialize database and start server
const startServer = async () => {
  // Start server first
  const server = app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base: http://localhost:${PORT}/api`);
  });
  
  // Connect to database (non-blocking)
  connectDB()
    .then(async () => {
      console.log('✅ Database connected successfully');
      
      // Auto-sync models with database (adds missing columns)
      const { sequelize } = require('./models');
      try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synced successfully');
      } catch (syncError) {
        console.error('⚠️ Database sync warning:', syncError.message);
      }
    })
    .catch(error => {
      console.error('❌ Database connection failed, but server is still running:', error.message);
    });
  
  return server;
};

startServer();

module.exports = app;


