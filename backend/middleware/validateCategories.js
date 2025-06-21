const validateCategories = (req, res, next) => {
  const { categories } = req.body;

  if (!Array.isArray(categories)) {
    return res.status(400).json({ mensaje: 'El campo categories debe ser un array' });
  }

  const categoriasUnicas = new Set(categories.map(c => `${c.name}-${c.type}`));

  if (categoriasUnicas.size !== categories.length) {
    return res.status(400).json({ mensaje: 'No se permiten categorías repetidas en el cuerpo de la solicitud.' });
  }

  next();
};

module.exports = validateCategories;