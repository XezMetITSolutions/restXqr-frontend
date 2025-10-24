// Comprehensive debug endpoint - Add this to index.js

app.get('/debug-system', async (req, res) => {
  try {
    const { sequelize, Staff, Restaurant, MenuCategory, MenuItem, Order, OrderItem, QRToken, Feature } = require('./models');
    
    // Get all data
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

    // HTML Response
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
