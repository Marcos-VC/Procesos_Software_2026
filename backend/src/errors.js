export class HttpError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function notFoundHandler(request, _response, next) {
  next(new HttpError(404, `Ruta no encontrada: ${request.method} ${request.path}`));
}

// Formato estándar de error: { error: true, code, message }
export function errorHandler(error, _request, response, _next) {
  let code = 500;
  let message = "Error interno del servidor";

  if (error instanceof HttpError) {
    code = error.code;
    message = error.message;
  } else if (error.type === "entity.parse.failed") {
    code = 400;
    message = "El cuerpo de la petición no es un JSON válido";
  } else {
    console.error(error);
  }

  response.status(code).json({ error: true, code, message });
}
