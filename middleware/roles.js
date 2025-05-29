// ===== middleware/roles.js =====
const authorize = (rolesAllowed) => (req, res, next) => { // Renomeado 'roles' para 'rolesAllowed' para clareza
  if (!req.user || !req.user.role) {
    return res.status(403).json({ error: 'Função do usuário não definida. Acesso negado.' });
  }
  if (!rolesAllowed.includes(req.user.role)) { // 
    return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para este recurso.' }); // 
  }
  next(); // 
};

module.exports = { authorize };