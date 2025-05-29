const express = require('express');
const bcrypt = require('bcrypt'); // 
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 
require('dotenv').config();

const router = express.Router();

// Rota para cadastro de usuário
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body; // 

  if (!name || !email || !password) { // 
    return res.status(400).json({ error: 'Por favor, preencha nome, email e senha' }); // 
  }

  try {
    const existingUser = await User.findOne({ where: { email } }); // 
    if (existingUser) { // 
      return res.status(409).json({ error: 'Email já está em uso' }); // 
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 

    const newUser = await User.create({ // 
      name,
      email,
      password: hashedPassword,
      role: role || 'user' // 'user' é o padrão no modelo e DB 
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso', // 
      userId: newUser.id, // 
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    console.error('Erro no cadastro:', error); // 
    // Verificar se é erro de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ error: 'Erro de validação', details: messages });
    }
    res.status(500).json({ error: 'Erro ao registrar usuário' }); // 
  }
});

// Rota para login
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // 

  if (!email || !password) { // 
    return res.status(400).json({ error: 'Por favor, informe email e senha' }); // 
  }

  try {
    const user = await User.findOne({ where: { email } }); // 

    if (!user) { // 
      return res.status(401).json({ error: 'Credenciais inválidas' }); // Mensagem genérica por segurança
    }

    const passwordMatch = await bcrypt.compare(password, user.password); // 
    if (!passwordMatch) { // 
      return res.status(401).json({ error: 'Credenciais inválidas' }); // Mensagem genérica
    }

    // Gerar Token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expira em 1 hora (ajuste conforme necessário)
    );

    res.json({
      message: 'Login efetuado com sucesso', // 
      userId: user.id, // 
      email: user.email,
      role: user.role,
      token: token
    });
  } catch (error) {
    console.error('Erro no cadastro:', error); // <--- ESTA LINHA MOSTRA O ERRO DETALHADO NO TERMINAL
    // Verificar se é erro de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ error: 'Erro de validação', details: messages });
    }
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

module.exports = router;