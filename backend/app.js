import 'dotenv/config';
import express from 'express';
import productsRoutes from './routes/products.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import usersRoutes from './routes/users.routes.js';
import authRoutes from './routes/auth.routes.js';
import ingredientRoutes from './routes/ingredients.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import promotionsRoutes from './routes/promotions.routes.js';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { validateEnv } from './config/validateEnv.js';
import errorHandler from './middleware/errorHandler.js';

validateEnv();

const app = express();
const port = process.env.PORT || 3000;

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// Rate limiting global: 300 peticiones por IP cada 15 min
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiadas peticiones, intenta de nuevo más tarde.' },
}));

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
    ].filter(Boolean),
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ingredient', ingredientRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/promotions', promotionsRoutes);

app.get('/bienvenido', (req, res) => {
  const mensaje = 'Bienvenido a Huerta';
  res.json({ mensaje });
});

// Middleware centralizado de errores
app.use(errorHandler);

// Solo escuchar si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
}

// Exportar para Vercel
export default app;
