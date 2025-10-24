const { Sequelize } = require('sequelize');
const { MenuItem, MenuCategory, Restaurant } = require('./src/models');

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/restxqr');

async function clearAndSeedData() {
  try {
    console.log('🗑️ Mevcut veriler temizleniyor...');
    
    // Aksaray restoranını bul
    const aksarayRestaurant = await Restaurant.findOne({
      where: { username: 'aksaray' }
    });
    
    if (!aksarayRestaurant) {
      console.error('❌ Aksaray restoranı bulunamadı!');
      return;
    }
    
    console.log('✅ Aksaray restoranı bulundu:', aksarayRestaurant.name);
    
    // Mevcut ürünleri ve kategorileri sil
    await MenuItem.destroy({
      where: { restaurantId: aksarayRestaurant.id }
    });
    
    await MenuCategory.destroy({
      where: { restaurantId: aksarayRestaurant.id }
    });
    
    console.log('✅ Mevcut veriler temizlendi');
    
    // Yeni kategoriler oluştur
    const categories = [
      {
        name: 'Çorbalar',
        description: 'Sıcak ve lezzetli çorbalarımız',
        displayOrder: 1
      },
      {
        name: 'Ana Yemekler',
        description: 'Doyurucu ana yemekler',
        displayOrder: 2
      },
      {
        name: 'Izgara',
        description: 'Taze ızgara etler',
        displayOrder: 3
      },
      {
        name: 'Pizza',
        description: 'El yapımı pizzalar',
        displayOrder: 4
      },
      {
        name: 'Salatalar',
        description: 'Taze ve sağlıklı salatalar',
        displayOrder: 5
      },
      {
        name: 'İçecekler',
        description: 'Soğuk ve sıcak içecekler',
        displayOrder: 6
      },
      {
        name: 'Tatlılar',
        description: 'Ev yapımı tatlılar',
        displayOrder: 7
      },
      {
        name: 'Kahvaltı',
        description: 'Geleneksel kahvaltılıklar',
        displayOrder: 8
      }
    ];
    
    console.log('📝 Yeni kategoriler oluşturuluyor...');
    const createdCategories = [];
    
    for (const categoryData of categories) {
      const category = await MenuCategory.create({
        ...categoryData,
        restaurantId: aksarayRestaurant.id
      });
      createdCategories.push(category);
      console.log(`✅ Kategori oluşturuldu: ${category.name}`);
    }
    
    // Yeni ürünler oluştur
    const menuItems = [
      // Çorbalar
      {
        name: 'Mercimek Çorbası',
        description: 'Geleneksel kırmızı mercimek çorbası',
        price: 25.00,
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
        categoryId: createdCategories[0].id,
        isPopular: true,
        preparationTime: 15,
        calories: 180,
        allergens: ['gluten'],
        portionSize: '300ml'
      },
      {
        name: 'Ezogelin Çorbası',
        description: 'Bulgur ve mercimekli geleneksel çorba',
        price: 28.00,
        imageUrl: 'https://images.unsplash.com/photo-1588566565463-180a5b2090d2?w=600&q=80',
        categoryId: createdCategories[0].id,
        preparationTime: 20,
        calories: 200,
        allergens: ['gluten'],
        portionSize: '300ml'
      },
      {
        name: 'Tavuk Çorbası',
        description: 'Ev yapımı tavuk suyu çorbası',
        price: 30.00,
        imageUrl: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=600&q=80',
        categoryId: createdCategories[0].id,
        preparationTime: 25,
        calories: 150,
        allergens: ['gluten'],
        portionSize: '300ml'
      },
      
      // Ana Yemekler
      {
        name: 'Karnıyarık',
        description: 'Patlıcan dolması, pilav ve cacık ile',
        price: 85.00,
        imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
        categoryId: createdCategories[1].id,
        isPopular: true,
        preparationTime: 30,
        calories: 450,
        allergens: ['gluten', 'dairy'],
        portionSize: '1 porsiyon'
      },
      {
        name: 'Mantı',
        description: 'El yapımı mantı, yoğurt ve tereyağı ile',
        price: 75.00,
        imageUrl: 'https://images.unsplash.com/photo-1612458654878-5c19f7308e90?w=600&q=80',
        categoryId: createdCategories[1].id,
        preparationTime: 35,
        calories: 400,
        allergens: ['gluten', 'dairy', 'eggs'],
        portionSize: '1 porsiyon'
      },
      {
        name: 'Etli Pilav',
        description: 'Kuzu etli özel pilav',
        price: 90.00,
        imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80',
        categoryId: createdCategories[1].id,
        preparationTime: 25,
        calories: 500,
        allergens: ['gluten'],
        portionSize: '1 porsiyon'
      },
      
      // Izgara
      {
        name: 'Adana Kebap',
        description: 'Acılı kıyma kebabı, pilav ve salata ile',
        price: 120.00,
        imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80',
        categoryId: createdCategories[2].id,
        isPopular: true,
        preparationTime: 20,
        calories: 600,
        allergens: ['gluten'],
        portionSize: '300g'
      },
      {
        name: 'Urfa Kebap',
        description: 'Acısız kıyma kebabı, pilav ve salata ile',
        price: 120.00,
        imageUrl: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600&q=80',
        categoryId: createdCategories[2].id,
        preparationTime: 20,
        calories: 580,
        allergens: ['gluten'],
        portionSize: '300g'
      },
      {
        name: 'Tavuk Şiş',
        description: 'Marine edilmiş tavuk göğsü, pilav ve salata ile',
        price: 95.00,
        imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&q=80',
        categoryId: createdCategories[2].id,
        preparationTime: 25,
        calories: 450,
        allergens: ['gluten'],
        portionSize: '250g'
      },
      
      // Pizza
      {
        name: 'Margherita Pizza',
        description: 'Mozzarella, domates ve fesleğen',
        price: 65.00,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
        categoryId: createdCategories[3].id,
        preparationTime: 15,
        calories: 350,
        allergens: ['gluten', 'dairy'],
        portionSize: '30cm'
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Mozzarella, pepperoni ve domates sosu',
        price: 75.00,
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80',
        categoryId: createdCategories[3].id,
        isPopular: true,
        preparationTime: 15,
        calories: 400,
        allergens: ['gluten', 'dairy'],
        portionSize: '30cm'
      },
      {
        name: 'Karışık Pizza',
        description: 'Mozzarella, sucuk, salam, mantar ve zeytin',
        price: 85.00,
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
        categoryId: createdCategories[3].id,
        preparationTime: 15,
        calories: 450,
        allergens: ['gluten', 'dairy'],
        portionSize: '30cm'
      },
      
      // Salatalar
      {
        name: 'Çoban Salata',
        description: 'Domates, salatalık, soğan, biber ve peynir',
        price: 35.00,
        imageUrl: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600&q=80',
        categoryId: createdCategories[4].id,
        preparationTime: 10,
        calories: 120,
        allergens: ['dairy'],
        portionSize: '1 porsiyon'
      },
      {
        name: 'Mevsim Salata',
        description: 'Taze mevsim yeşillikleri ve sos',
        price: 30.00,
        imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
        categoryId: createdCategories[4].id,
        preparationTime: 8,
        calories: 80,
        allergens: [],
        portionSize: '1 porsiyon'
      },
      {
        name: 'Tavuk Salata',
        description: 'Izgara tavuk, yeşillikler ve özel sos',
        price: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
        categoryId: createdCategories[4].id,
        preparationTime: 12,
        calories: 200,
        allergens: ['gluten'],
        portionSize: '1 porsiyon'
      },
      
      // İçecekler
      {
        name: 'Ayran',
        description: 'Ev yapımı ayran',
        price: 8.00,
        imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80',
        categoryId: createdCategories[5].id,
        preparationTime: 2,
        calories: 60,
        allergens: ['dairy'],
        portionSize: '250ml'
      },
      {
        name: 'Türk Kahvesi',
        description: 'Geleneksel Türk kahvesi',
        price: 12.00,
        imageUrl: 'https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=600&q=80',
        categoryId: createdCategories[5].id,
        preparationTime: 5,
        calories: 5,
        allergens: [],
        portionSize: '1 fincan'
      },
      {
        name: 'Çay',
        description: 'Demli Türk çayı',
        price: 5.00,
        imageUrl: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&q=80',
        categoryId: createdCategories[5].id,
        preparationTime: 3,
        calories: 2,
        allergens: [],
        portionSize: '1 bardak'
      },
      {
        name: 'Kola',
        description: 'Soğuk kola',
        price: 10.00,
        imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80',
        categoryId: createdCategories[5].id,
        preparationTime: 1,
        calories: 140,
        allergens: [],
        portionSize: '330ml'
      },
      
      // Tatlılar
      {
        name: 'Baklava',
        description: 'Antep fıstıklı baklava',
        price: 25.00,
        imageUrl: 'https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=600&q=80',
        categoryId: createdCategories[6].id,
        preparationTime: 5,
        calories: 300,
        allergens: ['gluten', 'nuts'],
        portionSize: '2 adet'
      },
      {
        name: 'Künefe',
        description: 'Sıcak künefe, kaymak ile',
        price: 35.00,
        imageUrl: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=600&q=80',
        categoryId: createdCategories[6].id,
        isPopular: true,
        preparationTime: 10,
        calories: 400,
        allergens: ['gluten', 'dairy'],
        portionSize: '1 porsiyon'
      },
      {
        name: 'Sütlaç',
        description: 'Ev yapımı sütlaç',
        price: 20.00,
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80',
        categoryId: createdCategories[6].id,
        preparationTime: 5,
        calories: 200,
        allergens: ['dairy'],
        portionSize: '1 porsiyon'
      },
      
      // Kahvaltı
      {
        name: 'Serpme Kahvaltı',
        description: 'Peynir, zeytin, yumurta, domates, salatalık',
        price: 60.00,
        imageUrl: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&q=80',
        categoryId: createdCategories[7].id,
        preparationTime: 15,
        calories: 350,
        allergens: ['dairy', 'eggs'],
        portionSize: '1 kişilik'
      },
      {
        name: 'Menemen',
        description: 'Domates, biber ve yumurta',
        price: 25.00,
        imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&q=80',
        categoryId: createdCategories[7].id,
        preparationTime: 10,
        calories: 180,
        allergens: ['eggs'],
        portionSize: '1 porsiyon'
      },
      {
        name: 'Omlet',
        description: 'Peynirli omlet',
        price: 20.00,
        imageUrl: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=600&q=80',
        categoryId: createdCategories[7].id,
        preparationTime: 8,
        calories: 200,
        allergens: ['eggs', 'dairy'],
        portionSize: '1 porsiyon'
      }
    ];
    
    console.log('🍽️ Yeni ürünler oluşturuluyor...');
    
    for (const itemData of menuItems) {
      const item = await MenuItem.create({
        ...itemData,
        restaurantId: aksarayRestaurant.id
      });
      console.log(`✅ Ürün oluşturuldu: ${item.name} - ${item.price}₺`);
    }
    
    console.log('🎉 Veri ekleme işlemi tamamlandı!');
    console.log(`📊 Toplam ${createdCategories.length} kategori ve ${menuItems.length} ürün eklendi.`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await sequelize.close();
  }
}

// Script'i çalıştır
clearAndSeedData();
