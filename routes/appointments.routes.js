const express = require('express');
const Appointment = require('../models/Appointment'); // 
const User = require('../models/User'); // Necessário para o include com alias correto
const { authenticate } = require('../middleware/authenticate'); // Corrigido para novo nome de arquivo/função 
const { authorize } = require('../middleware/roles'); // 

const router = express.Router();

// Criar novo agendamento
router.post('/', authenticate, authorize(['user']), async (req, res) => { // 
  const { dateTime } = req.body; // // Espera 'dateTime' do frontend
  const userId = req.user.id; // Obtido do token JWT via middleware authenticate

  if (!dateTime) {
    return res.status(400).json({ error: 'O campo dateTime é obrigatório.' });
  }

  try {
    // dateTime deve estar em um formato que o JS Date/Sequelize possa interpretar, ex: ISO 8601 "YYYY-MM-DDTHH:mm:ss.sssZ"
    const appointment = await Appointment.create({ userId, dateTime }); // userId e dateTime conforme modelo corrigido 
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Erro ao criar agendamento:', err);
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ error: 'Erro de validação ao agendar', details: messages });
    }
    res.status(400).json({ error: 'Erro ao agendar' }); // 
  }
});

// Listar todos os agendamentos (para atendentes e admins)
router.get('/', authenticate, authorize(['attendant', 'admin']), async (req, res) => { // 
  try {
    const appointments = await Appointment.findAll({
      include: [{
        model: User,
        as: 'user', // Alias definido na associação em Appointment.js 
        attributes: ['id', 'name', 'email'] // Seleciona apenas alguns atributos do usuário
      }],
      order: [['dateTime', 'ASC']] // Ordena por data
    });
    res.json(appointments);
  } catch (err) {
    console.error('Erro ao buscar agendamentos:', err);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// Listar agendamentos do usuário logado (para o próprio usuário)
router.get('/my-appointments', authenticate, authorize(['user', 'attendant']), async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['dateTime', 'ASC']]
    });
    res.json(appointments);
  } catch (err) {
    console.error('Erro ao buscar meus agendamentos:', err);
    res.status(500).json({ error: 'Erro ao buscar meus agendamentos' });
  }
});


// Cancelar um agendamento (usuário pode cancelar o seu, admin pode cancelar qualquer um)
router.patch('/:id/cancel', authenticate, authorize(['user', 'admin']), async (req, res) => { // Mudei para PATCH e rota mais descritiva
  try {
    const appointment = await Appointment.findByPk(req.params.id); // 

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Usuário só pode cancelar o próprio agendamento, a menos que seja admin
    if (req.user.role !== 'admin' && appointment.userId !== req.user.id) { // 
      return res.status(403).json({ error: 'Acesso negado para cancelar este agendamento' }); // 
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Este agendamento já está cancelado.' });
    }

    appointment.status = 'cancelled'; // 
    await appointment.save(); // 
    res.json({ message: 'Agendamento cancelado com sucesso', appointment }); // 
  } catch (err) {
    console.error('Erro ao cancelar agendamento:', err);
    res.status(500).json({ error: 'Erro ao cancelar agendamento' });
  }
});

// Excluir um agendamento (somente admin) - Se necessário, caso contrário, apenas cancelar.
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    await appointment.destroy();
    res.json({ message: 'Agendamento excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir agendamento:', err);
    res.status(500).json({ error: 'Erro ao excluir agendamento' });
  }
});


module.exports = router;