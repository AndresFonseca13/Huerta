const validateQueryGetAll = (req, res, next) => {
  const { pagina, limite, orden, categoria, tipo } = req.query;

  if (pagina && (isNaN(parseInt(pagina)) || parseInt(pagina) < 1)) {
    return res.status(400).json({ mensaje: 'El parámetro pagina debe ser un número entero mayor que 0' });
  }

  if (limite && (isNaN(parseInt(limite)) || parseInt(limite) < 1)) {
    return res.status(400).json({ mensaje: 'El parámetro limite debe ser un número entero mayor que 0' });
  }

  if (orden && !['name', 'price'].includes(orden)) {
    return res.status(400).json({ mensaje: 'El parámetro orden solo puede ser "name" o "price"' });
  }

  if (categoria && typeof categoria !== 'string') {
    return res.status(400).json({ mensaje: 'El parámetro categoria debe ser un texto' });
  }

  if (tipo && typeof tipo !== 'string') {
    return res.status(400).json({ mensaje: 'El parámetro tipo debe ser un texto' });
  }

  next();
};

module.exports = validateQueryGetAll;