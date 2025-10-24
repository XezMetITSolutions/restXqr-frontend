const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Safe model import with fallback
let ServiceCall, Restaurant;
try {
  const models = require('../models');
  ServiceCall = models.ServiceCall;
  Restaurant = models.Restaurant;
} catch (error) {
  console.error('Model import error:', error);
  ServiceCall = null;
  Restaurant = null;
}

// POST /api/service-call - Create a service call
router.post('/', async (req, res) => {
  try {
    console.log('🔔 Service call endpoint called:', req.body);
    
    if (!ServiceCall || !Restaurant) {
      console.error('❌ Models not loaded:', { ServiceCall: !!ServiceCall, Restaurant: !!Restaurant });
      return res.status(503).json({
        success: false,
        message: 'Service system temporarily unavailable - models not loaded'
      });
    }

    const { restaurantId, tableNumber, serviceType, message, timestamp } = req.body;
    
    console.log('📝 Service call data:', { restaurantId, tableNumber, serviceType, message });
    
    if (!restaurantId || !tableNumber || !serviceType || !message) {
      console.error('❌ Missing required fields:', { restaurantId, tableNumber, serviceType, message });
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, table number, service type and message are required'
      });
    }
    
    // Verify restaurant exists
    console.log('🔍 Checking restaurant:', restaurantId);
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      console.error('❌ Restaurant not found:', restaurantId);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    console.log('✅ Restaurant found:', restaurant.name);
    
    // Create service call
    const serviceCall = await ServiceCall.create({
      restaurantId,
      tableNumber,
      serviceType,
      message,
      timestamp: timestamp || new Date(),
      status: 'pending',
      createdAt: new Date()
    });

    console.log('✅ Service call created:', serviceCall.id);
    
    res.status(201).json({
      success: true,
      data: {
        id: serviceCall.id,
        restaurantId: serviceCall.restaurantId,
        tableNumber: serviceCall.tableNumber,
        serviceType: serviceCall.serviceType,
        message: serviceCall.message,
        status: serviceCall.status,
        timestamp: serviceCall.timestamp
      }
    });
    
  } catch (error) {
    console.error('Create service call error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/service-call/restaurant/:restaurantId - Get service calls for restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status = 'pending' } = req.query;
    
    const serviceCalls = await ServiceCall.findAll({
      where: {
        restaurantId,
        status: status === 'all' ? undefined : status
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json({
      success: true,
      data: serviceCalls
    });
    
  } catch (error) {
    console.error('Get service calls error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/service-call/:id/status - Update service call status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, completed, or cancelled'
      });
    }
    
    const serviceCall = await ServiceCall.findByPk(id);
    if (!serviceCall) {
      return res.status(404).json({
        success: false,
        message: 'Service call not found'
      });
    }
    
    await serviceCall.update({ 
      status,
      completedAt: status === 'completed' ? new Date() : null
    });
    
    res.json({
      success: true,
      data: serviceCall
    });
    
  } catch (error) {
    console.error('Update service call status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

