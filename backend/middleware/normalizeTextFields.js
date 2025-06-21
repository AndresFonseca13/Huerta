const normalizeTextFields = (req, res, next) => {
  const keysToNormalize = ['name', 'ingredients'];

  const cleanText = (text) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')   // Reemplaza múltiples espacios por uno solo
      .trim();                // Elimina espacios al inicio y final
  };

  for (const key of keysToNormalize) {
    if (req.body[key]) {
      if (Array.isArray(req.body[key])) {
        req.body[key] = req.body[key].map(el => cleanText(el));
      } else {
        req.body[key] = cleanText(req.body[key]);
      }
    }
  }

  // Si hay categorías, normalizamos cada una
  if (req.body.categories) {
    req.body.categories = req.body.categories.map(c => ({
      name: cleanText(c.name),
      type: cleanText(c.type)
    }));
  }

  next();
};

module.exports = normalizeTextFields;