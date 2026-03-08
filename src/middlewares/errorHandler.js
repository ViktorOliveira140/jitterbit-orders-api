function errorHandler(err, _req, res, _next) {
  // Mantém a resposta de erro consistente.
  const statusCode = Number(err.statusCode || 500);

  // Erro clássico de JSON inválido no body.
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: { message: 'Invalid JSON body' },
    });
  }

  const payload = {
    error: {
      message: err.message || 'Internal Server Error',
    },
  };

  if (process.env.NODE_ENV !== 'production' && err.details) {
    payload.error.details = err.details;
  }

  return res.status(statusCode).json(payload);
}

module.exports = { errorHandler };

