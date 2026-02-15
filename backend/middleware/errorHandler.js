const errorHandler = (err, req, res, _next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    mensaje: statusCode === 500
      ? 'Error interno del servidor'
      : err.message,
    ...(isProduction ? {} : { error: err.message }),
  });
};

export default errorHandler;
