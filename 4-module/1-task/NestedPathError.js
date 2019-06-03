class LimitExceededError extends Error {
  constructor() {
    super('Path is nested.');

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.code = 'NESTED_PATH';
  }
}

module.exports = LimitExceededError;
