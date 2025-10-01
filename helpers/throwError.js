function throwError(errorMsg, status) {
  const error = new Error(errorMsg);
  error.status = status;
  throw error;
}
module.exports = throwError;
