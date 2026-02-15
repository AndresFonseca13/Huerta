const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;

const validateQueryGetAll = (req, res, next) => {
  const { pagina, limite, orden, categoria, tipo, page, limit, searchTerm } = req.query;

  const pageVal = pagina || page;
  const limitVal = limite || limit;

  if (pageVal && (isNaN(parseInt(pageVal)) || parseInt(pageVal) < 1)) {
    return res.status(400).json({
      mensaje: 'El parámetro pagina debe ser un número entero mayor que 0',
    });
  }

  if (limitVal) {
    const parsed = parseInt(limitVal);
    if (isNaN(parsed) || parsed < 1) {
      return res.status(400).json({
        mensaje: 'El parámetro limite debe ser un número entero mayor que 0',
      });
    }
    // Forzar límite máximo
    if (parsed > MAX_LIMIT) {
      req.query.limit = String(MAX_LIMIT);
      req.query.limite = String(MAX_LIMIT);
    }
  }

  if (orden && !['name', 'price'].includes(orden)) {
    return res.status(400).json({
      mensaje: 'El parámetro orden solo puede ser "name" o "price"',
    });
  }

  if (categoria && typeof categoria !== 'string') {
    return res.status(400).json({
      mensaje: 'El parámetro categoria debe ser un texto',
    });
  }

  if (tipo && typeof tipo !== 'string') {
    return res.status(400).json({
      mensaje: 'El parámetro tipo debe ser un texto',
    });
  }

  if (searchTerm && searchTerm.length > MAX_SEARCH_LENGTH) {
    return res.status(400).json({
      mensaje: `El término de búsqueda no puede exceder ${MAX_SEARCH_LENGTH} caracteres`,
    });
  }

  next();
};

export default validateQueryGetAll;
