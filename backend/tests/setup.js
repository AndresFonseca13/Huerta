// Configuración del entorno de test
process.env.NODE_ENV = 'test';

// Silenciar console.log durante los tests
const originalLog = console.log;
console.log = (...args) => {
  // Solo mostrar logs si no son del servidor
  if (!args[0]?.includes('Servidor escuchando')) {
    originalLog(...args);
  }
};
