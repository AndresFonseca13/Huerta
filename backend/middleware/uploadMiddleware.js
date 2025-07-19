import multer from 'multer';

// Configuración de multer con límites y filtros
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          'Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP.'
        ),
        false
      );
    }
    cb(null, true);
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        mensaje:
					'El archivo es demasiado grande. El tamaño máximo permitido es 5MB'
      });
    }
    return res.status(400).json({
      error: true,
      mensaje: error.message
    });
  }
  next(error);
};

export { upload, handleMulterError };
