require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // Porta padrão do MySQL
    dialect: 'mysql', // Alterado para MySQL
    logging: false, // Mude para console.log para ver as queries SQL
    define: {
      timestamps: true, // Sequelize irá gerenciar createdAt e updatedAt
      // underscored: false, // Se false (padrão), Sequelize espera createdAt, updatedAt.
                           // Se true, esperaria created_at, updated_at.
                           // Vamos manter o padrão e garantir que o script SQL use createdAt, updatedAt.
    }
  }
);

module.exports = sequelize;