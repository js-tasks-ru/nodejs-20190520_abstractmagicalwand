function normalizeValidationError(errors) {
  const errorArray = Object.entries(errors);
  const formatedErrors = {};

  for ([name, {message}] of errorArray) {
    formatedErrors[name] = message;
  }

  return formatedErrors;
}

module.exports = normalizeValidationError;
