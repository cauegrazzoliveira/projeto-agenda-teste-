const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido ou mal formatado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Opcional: Verificar se o usuário ainda existe no banco
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'email', 'role'] });
    if (!user) {
      return res.status(401).json({ error: 'Usuário do token não encontrado.' });
    }
    
    // Adiciona o usuário (ou suas informações decodificadas) ao objeto req
    // req.user = decoded;
    req.user = user.toJSON(); // Usar o usuário do banco garante dados mais recentes e consistência

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    console.error("Erro na autenticação do token:", error);
    return res.status(401).json({ error: 'Falha na autenticação do token.' });
  }
};

module.exports = { authenticate };