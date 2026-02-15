import jwt from 'jsonwebtoken';
import signupService from '../services/auth/signupService.js';
import loginService from '../services/auth/loginService.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const signup = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await signupService(username, password, role);
    res.status(201).json({ mensaje: 'Usuario creado exitosamente', user });
  } catch (err) {
    res.status(400).json({ mensaje: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { accessToken, refreshToken, username: user, role } =
      await loginService(username, password);

    res.cookie('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.status(200).json({ mensaje: 'Login exitoso', username: user, role });
  } catch (err) {
    res.status(401).json({ mensaje: err.message });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ mensaje: 'Refresh token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }

    // Obtener datos actuales del usuario desde la DB
    const pool = (await import('../config/db.js')).default;
    const result = await pool.query(
      `SELECT u.id, u.username, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.id],
    );

    if (!result.rows.length) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado o inactivo' });
    }

    const user = result.rows[0];
    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    res.cookie('access_token', newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ mensaje: 'Token renovado', username: user.username, role: user.role_name });
  } catch {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return res.status(401).json({ mensaje: 'Refresh token expirado o inválido' });
  }
};

const logout = async (_req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth' });
  res.status(200).json({ mensaje: 'Sesión cerrada' });
};

const me = async (req, res) => {
  res.status(200).json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
  });
};

export default {
  signup,
  login,
  refresh,
  logout,
  me,
};
