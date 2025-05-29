const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  dateTime: {
    type: DataTypes.DATE, // Sequelize mapeia DataTypes.DATE para TIMESTAMP no MySQL
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'scheduled',
    validate: {
      isIn: [['scheduled', 'cancelled']]
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
  // createdAt e updatedAt são gerenciados pelo Sequelize
}, {
  tableName: 'Appointments'
});

// Associações
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });

module.exports = Appointment;