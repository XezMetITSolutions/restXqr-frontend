const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ServiceCall = sequelize.define('ServiceCall', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Restaurants',
        key: 'id'
      }
    },
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    serviceType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['water', 'clean', 'bill', 'utensils', 'custom']]
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'service_calls',
    timestamps: true,
    indexes: [
      {
        fields: ['restaurantId', 'status']
      },
      {
        fields: ['tableNumber']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  ServiceCall.associate = (models) => {
    ServiceCall.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'Restaurant'
    });
  };

  return ServiceCall;
};

