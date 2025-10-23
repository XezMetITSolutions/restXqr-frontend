import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantUsername } = body;

    if (!restaurantUsername) {
      return NextResponse.json({
        success: false,
        message: 'Restaurant username is required'
      }, { status: 400 });
    }

    // Simulated menu data (since backend is not available yet)
    const categories = [
      {
        id: '1',
        name: 'Çorbalar',
        description: 'Sıcak ve lezzetli çorbalarımız',
        displayOrder: 1
      },
      {
        id: '2',
        name: 'Ana Yemekler',
        description: 'Doyurucu ana yemekler',
        displayOrder: 2
      },
      {
        id: '3',
        name: 'Izgara',
        description: 'Taze ızgara etler',
        displayOrder: 3
      },
      {
        id: '4',
        name: 'Pizza',
        description: 'El yapımı pizzalar',
        displayOrder: 4
      },
      {
        id: '5',
        name: 'Salatalar',
        description: 'Taze ve sağlıklı salatalar',
        displayOrder: 5
      },
      {
        id: '6',
        name: 'İçecekler',
        description: 'Soğuk ve sıcak içecekler',
        displayOrder: 6
      },
      {
        id: '7',
        name: 'Tatlılar',
        description: 'Ev yapımı tatlılar',
        displayOrder: 7
      },
      {
        id: '8',
        name: 'Kahvaltı',
        description: 'Geleneksel kahvaltılıklar',
        displayOrder: 8
      }
    ];

    const menuItems = [
      // Çorbalar
      {
        id: '1',
        name: 'Mercimek Çorbası',
        description: 'Geleneksel kırmızı mercimek çorbası',
        price: 25.00,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        categoryId: '1',
        isPopular: true,
        preparationTime: 15,
        calories: 180,
        allergens: ['gluten'],
        portionSize: '300ml'
      },
      {
        id: '2',
        name: 'Ezogelin Çorbası',
        description: 'Bulgur ve mercimekli geleneksel çorba',
        price: 28.00,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        categoryId: '1',
        preparationTime: 20,
        calories: 200,
        allergens: ['gluten'],
        portionSize: '300ml'
      },
      {
        id: '3',
        name: 'Tavuk Çorbası',
        description: 'Ev yapımı tavuk suyu çorbası',
        price: 30.00,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        categoryId: '1',
        preparationTime: 25,
        calories: 150,
        allergens: ['gluten'],
        portionSize: '300ml'
      },
      
      // Ana Yemekler
      {
        id: '4',
        name: 'Karnıyarık',
        description: 'Patlıcan dolması, pilav ve cacık ile',
        price: 85.00,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        categoryId: '2',
        isPopular: true,
        preparationTime: 30,
        calories: 450,
        allergens: ['gluten', 'dairy'],
        portionSize: '1 porsiyon'
      },
      {
        id: '5',
        name: 'Mantı',
        description: 'El yapımı mantı, yoğurt ve tereyağı ile',
        price: 75.00,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        categoryId: '2',
        preparationTime: 35,
        calories: 400,
        allergens: ['gluten', 'dairy', 'eggs'],
        portionSize: '1 porsiyon'
      },
      {
        id: '6',
        name: 'Etli Pilav',
        description: 'Kuzu etli özel pilav',
        price: 90.00,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        categoryId: '2',
        preparationTime: 25,
        calories: 500,
        allergens: ['gluten'],
        portionSize: '1 porsiyon'
      },
      
      // Izgara
      {
        id: '7',
        name: 'Adana Kebap',
        description: 'Acılı kıyma kebabı, pilav ve salata ile',
        price: 120.00,
        imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
        categoryId: '3',
        isPopular: true,
        preparationTime: 20,
        calories: 600,
        allergens: ['gluten'],
        portionSize: '300g'
      },
      {
        id: '8',
        name: 'Urfa Kebap',
        description: 'Acısız kıyma kebabı, pilav ve salata ile',
        price: 120.00,
        imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
        categoryId: '3',
        preparationTime: 20,
        calories: 580,
        allergens: ['gluten'],
        portionSize: '300g'
      },
      {
        id: '9',
        name: 'Tavuk Şiş',
        description: 'Marine edilmiş tavuk göğsü, pilav ve salata ile',
        price: 95.00,
        imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
        categoryId: '3',
        preparationTime: 25,
        calories: 450,
        allergens: ['gluten'],
        portionSize: '250g'
      },
      
      // Pizza
      {
        id: '10',
        name: 'Margherita Pizza',
        description: 'Mozzarella, domates ve fesleğen',
        price: 65.00,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        categoryId: '4',
        preparationTime: 15,
        calories: 350,
        allergens: ['gluten', 'dairy'],
        portionSize: '30cm'
      },
      {
        id: '11',
        name: 'Pepperoni Pizza',
        description: 'Mozzarella, pepperoni ve domates sosu',
        price: 75.00,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        categoryId: '4',
        isPopular: true,
        preparationTime: 15,
        calories: 400,
        allergens: ['gluten', 'dairy'],
        portionSize: '30cm'
      },
      {
        id: '12',
        name: 'Karışık Pizza',
        description: 'Mozzarella, sucuk, salam, mantar ve zeytin',
        price: 85.00,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        categoryId: '4',
        preparationTime: 15,
        calories: 450,
        allergens: ['gluten', 'dairy'],
        portionSize: '30cm'
      },
      
      // Salatalar
      {
        id: '13',
        name: 'Çoban Salata',
        description: 'Domates, salatalık, soğan, biber ve peynir',
        price: 35.00,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        categoryId: '5',
        preparationTime: 10,
        calories: 120,
        allergens: ['dairy'],
        portionSize: '1 porsiyon'
      },
      {
        id: '14',
        name: 'Mevsim Salata',
        description: 'Taze mevsim yeşillikleri ve sos',
        price: 30.00,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        categoryId: '5',
        preparationTime: 8,
        calories: 80,
        allergens: [],
        portionSize: '1 porsiyon'
      },
      {
        id: '15',
        name: 'Tavuk Salata',
        description: 'Izgara tavuk, yeşillikler ve özel sos',
        price: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        categoryId: '5',
        preparationTime: 12,
        calories: 200,
        allergens: ['gluten'],
        portionSize: '1 porsiyon'
      },
      
      // İçecekler
      {
        id: '16',
        name: 'Ayran',
        description: 'Ev yapımı ayran',
        price: 8.00,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        categoryId: '6',
        preparationTime: 2,
        calories: 60,
        allergens: ['dairy'],
        portionSize: '250ml'
      },
      {
        id: '17',
        name: 'Türk Kahvesi',
        description: 'Geleneksel Türk kahvesi',
        price: 12.00,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        categoryId: '6',
        preparationTime: 5,
        calories: 5,
        allergens: [],
        portionSize: '1 fincan'
      },
      {
        id: '18',
        name: 'Çay',
        description: 'Demli Türk çayı',
        price: 5.00,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        categoryId: '6',
        preparationTime: 3,
        calories: 2,
        allergens: [],
        portionSize: '1 bardak'
      },
      {
        id: '19',
        name: 'Kola',
        description: 'Soğuk kola',
        price: 10.00,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        categoryId: '6',
        preparationTime: 1,
        calories: 140,
        allergens: [],
        portionSize: '330ml'
      },
      
      // Tatlılar
      {
        id: '20',
        name: 'Baklava',
        description: 'Antep fıstıklı baklava',
        price: 25.00,
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        categoryId: '7',
        preparationTime: 5,
        calories: 300,
        allergens: ['gluten', 'nuts'],
        portionSize: '2 adet'
      },
      {
        id: '21',
        name: 'Künefe',
        description: 'Sıcak künefe, kaymak ile',
        price: 35.00,
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        categoryId: '7',
        isPopular: true,
        preparationTime: 10,
        calories: 400,
        allergens: ['gluten', 'dairy'],
        portionSize: '1 porsiyon'
      },
      {
        id: '22',
        name: 'Sütlaç',
        description: 'Ev yapımı sütlaç',
        price: 20.00,
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        categoryId: '7',
        preparationTime: 5,
        calories: 200,
        allergens: ['dairy'],
        portionSize: '1 porsiyon'
      },
      
      // Kahvaltı
      {
        id: '23',
        name: 'Serpme Kahvaltı',
        description: 'Peynir, zeytin, yumurta, domates, salatalık',
        price: 60.00,
        imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
        categoryId: '8',
        preparationTime: 15,
        calories: 350,
        allergens: ['dairy', 'eggs'],
        portionSize: '1 kişilik'
      },
      {
        id: '24',
        name: 'Menemen',
        description: 'Domates, biber ve yumurta',
        price: 25.00,
        imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
        categoryId: '8',
        preparationTime: 10,
        calories: 180,
        allergens: ['eggs'],
        portionSize: '1 porsiyon'
      },
      {
        id: '25',
        name: 'Omlet',
        description: 'Peynirli omlet',
        price: 20.00,
        imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
        categoryId: '8',
        preparationTime: 8,
        calories: 200,
        allergens: ['eggs', 'dairy'],
        portionSize: '1 porsiyon'
      }
    ];

    // Simulate successful response
    return NextResponse.json({
      success: true,
      message: `Menu seeded successfully for ${restaurantUsername}`,
      data: {
        categories: categories.length,
        items: menuItems.length,
        categoriesData: categories,
        itemsData: menuItems
      }
    });

  } catch (error) {
    console.error('Seed menu API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
