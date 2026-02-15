import jwt from 'jsonwebtoken';
const secretKey = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  // Leer token desde cookie HTTP-only (preferido) o header Authorization (fallback)
  let token = req.cookies?.access_token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

export default authMiddleware;
