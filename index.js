const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./database'); // 

// Importar modelos para que o Sequelize os conheça antes do sync
require('./models/User');
require('./models/Appointment');

const authRoutes = require('./routes/auth.routes'); // 
const appointmentRoutes = require('./routes/appointments.routes'); // 

dotenv.config(); // 

const app = express();
app.use(cors()); // 
app.use(express.json()); // 

app.use('/api/auth', authRoutes); // 
app.use('/api/appointments', appointmentRoutes); // 

app.get('/', (req, res) => {
  res.send('API da Agenda Funcionando!');
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Banco de dados conectado com sucesso!'); // 
    // Sincronizar modelos com o banco de dados
    // Em desenvolvimento, você pode usar { alter: true } ou { force: true }
    // CUIDADO: { force: true } APAGA as tabelas existentes.
    // Para produção, use migrações.
    return sequelize.sync(); // Sincroniza se as tabelas não existirem ou se {alter:true} ou {force:true} for usado.
  })
  .then(() => {
    console.log('Banco de dados sincronizado'); // 
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`); // 
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ou sincronizar o banco de dados:', err); // 
  });