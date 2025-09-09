const validateCategories = (req, res, next) => {
  const { categories } = req.body;

  if (!Array.isArray(categories)) {
    return res
      .status(400)
      .json({ mensaje: 'El campo categories debe ser un array' });
  }

  // Normalizar: si name es 'cocktail' o 'comida', su tipo debe ser 'clasificacion';
  // si type es 'destilado', mantener. Evitar duplicados por nombre manteniendo preferencia por type válido.
  const normalized = [];
  const seenByName = new Map();
  for (const c of categories) {
    const name = String(c.name || '')
      .trim()
      .toLowerCase();
    let type = String(c.type || '')
      .trim()
      .toLowerCase();
    if (name === 'cocktail' || name === 'comida') {
      type = 'clasificacion';
    }
    if (
      type !== 'destilado' &&
			type !== 'clasificacion' &&
			type !== 'clasificacion comida'
    ) {
      // si viene otro type, mantén el anterior si existe para este name
      if (seenByName.has(name)) continue;
      // por defecto para nombres no identificadores, destilado (no forzamos)
    }
    const key = name;
    const current = seenByName.get(key);
    if (!current) {
      seenByName.set(key, { name: c.name, type });
    } else {
      // preferir destilado para nombres de destilados, y 'clasificacion' para identificadores
      const prefer =
				name === 'cocktail' || name === 'comida'
				  ? 'clasificacion'
				  : 'destilado';
      if (current.type !== prefer && type === prefer) {
        seenByName.set(key, { name: c.name, type });
      }
    }
  }
  for (const v of seenByName.values()) normalized.push(v);

  req.body.categories = normalized;

  const categoriasUnicas = new Set(
    normalized.map((c) => `${c.name}-${c.type}`),
  );

  if (categoriasUnicas.size !== categories.length) {
    return res.status(400).json({
      mensaje:
				'No se permiten categorías repetidas en el cuerpo de la solicitud.',
    });
  }

  next();
};

export default validateCategories;
