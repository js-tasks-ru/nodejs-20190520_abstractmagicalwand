const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.setDefaultEncoding(options.encoding);
    this.restOfChunk = '';
  }

  _transform(chunk, encoding, callback) {
    const separatedChunk = (this.restOfChunk + chunk).split(os.EOL);
    this.restOfChunk = separatedChunk.pop();

    separatedChunk.forEach((chunk) => {
      this.push(chunk);
    });

    callback(null);
  }

  _flush(callback) {
    callback(null, this.restOfChunk);
  }
}

module.exports = LineSplitStream;
