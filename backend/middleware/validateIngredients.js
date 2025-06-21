const validateIngredients = (req, res, next) => {
  const { ingredients } = req.body;

  if (!Array.isArray(ingredients)) {
    return res.status(400).json({ mensaje: 'El campo ingredients debe ser un array' });
  }

  const ingredientesUnicos = new Set(ingredients.map(i => i.trim().toLowerCase()));

  if (ingredientesUnicos.size !== ingredients.length) {
    return res.status(400).json({ mensaje: 'No se permiten ingredientes duplicados en el cuerpo de la solicitud.' });
  }

  next();
};

module.exports = validateIngredients;