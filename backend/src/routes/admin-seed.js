const express = require('express');
const router = express.Router();
const { MenuItem, MenuCategory, Restaurant } = require('../models');

// POST /api/admin/seed-menu - Seed menu data for restaurant
router.post('/seed-menu', async (req, res) => {
  try {
    console.log('🌱 Menu seed endpoint called');
    
    const { restaurantUsername } = req.body;
    
    if (!restaurantUsername) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant username is required'
      });
    }
    
    // Find restaurant
    const restaurant = await Restaurant.findOne({
      where: { username: restaurantUsername }
    });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    console.log('✅ Restaurant found:', restaurant.name);
    
    // Clear existing data
    await MenuItem.destroy({
      where: { restaurantId: restaurant.id }
    });
    
    await MenuCategory.destroy({
      where: { restaurantId: restaurant.id }
    });
    
    console.log('✅ Existing data cleared');
    
    // Create categories
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
    
    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await MenuCategory.create({
        ...categoryData,
        restaurantId: restaurant.id
      });
      createdCategories.push(category);
    }
    
    // Create menu items with correct images for each specific product
    const menuItems = [
      // Çorbalar
      {
        name: 'Mercimek Çorbası',
        description: 'Geleneksel kırmızı mercimek çorbası',
        price: 25.00,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
        categoryId: createdCategories[7].id,
        preparationTime: 8,
        calories: 200,
        allergens: ['eggs', 'dairy'],
        portionSize: '1 porsiyon'
      }
    ];
    
    for (const itemData of menuItems) {
      await MenuItem.create({
        ...itemData,
        restaurantId: restaurant.id
      });
    }
    
    res.json({
      success: true,
      message: `Menu seeded successfully for ${restaurant.name}`,
      data: {
        categories: createdCategories.length,
        items: menuItems.length
      }
    });
    
  } catch (error) {
    console.error('Seed menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;