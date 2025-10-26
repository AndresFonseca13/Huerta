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

const app = express();
const port = process.env.PORT || 3000;

// Esto habilita CORS para todos los dominios (en desarrollo está bien)
app.use(
  cors({
    origin: [
      'https://happy-bush-09337730f.3.azurestaticapps.net', // Frontend en producción
      'http://localhost:5173', // Desarrollo local
    ],
    credentials: true,
  }),
);

// Tu configuración actual
app.use(express.json());
// app.use('/api/...') etc

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

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
  // Log de variables de entorno en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.log('Variables de entorno cargadas:');
    console.log(
      'AZURE_STORAGE_ACCOUNT_NAME:',
      process.env.AZURE_STORAGE_ACCOUNT_NAME ? 'Configurado' : 'No configurado',
    );
    console.log(
      'AZURE_STORAGE_CONNECTION_STRING:',
      process.env.AZURE_STORAGE_CONNECTION_STRING
        ? 'Configurado'
        : 'No configurado',
    );
  }
});
