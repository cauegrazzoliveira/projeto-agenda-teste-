const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'attendant', 'admin']],
    }
  }
  // createdAt e updatedAt são gerenciados pelo Sequelize por padrão
  // se 'timestamps: true' (que é o padrão para a instância do Sequelize agora)
}, {
  tableName: 'Users'
  // Não precisa de createdAt: 'algumNome', updatedAt: 'algumNome' aqui
  // se o script SQL usa 'createdAt' e 'updatedAt' e underscored não está forçando snake_case.
});

module.exports = User;