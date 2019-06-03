class FileExistsError extends Error {
  constructor() {
    super('File already exists.');

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.code = 'EEXIST';
  }
}

module.exports = FileExistsError;
