const notFound = (req, res, next) => {
  const error = new Error(`Route ${res.originalUrl} not found`);
  error.status = 404;
  next(error);
};
const errHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: error.status || 500,
    success: false,
    mes: error?.message || "internal server error",
  });
};
module.exports = {
  notFound,
  errHandler,
};
