const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const FileExistsError = require('./FileExistsError');

const server = new http.Server();

const ONE_MEGABYTE_IN_BYTES = 1 * 1000 * 1000;

async function writeFile(req, res, filepath) {
  await fs.promises.stat(filepath)
      .then(
          (fileStat) => {
            if (fileStat.isFile()) {
              throw new FileExistsError();
            }
          },
          (error) => {
            if (error.code === 'ENOENT') {
              return;
            }

            throw error;
          }
      );

  const limitSizeStream = new LimitSizeStream({limit: ONE_MEGABYTE_IN_BYTES});
  const fileOut = fs.createWriteStream(filepath);

  await new Promise((resolve, reject) => {
    req
        .on('aborted', handleErrorAndAborting)
        .on('error', handleErrorAndAborting)
        .pipe(limitSizeStream)
        .on('error', handleErrorAndAborting)
        .pipe(fileOut)
        .on('error', handleErrorAndAborting)
        .on('finish', resolve);

    function handleErrorAndAborting(error) {
      fs.unlink(filepath, () => {});
      reject(error);
      limitSizeStream.destroy();
    };
  });
}

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      writeFile(req, res, filepath)
          .then(
              () => {
                res.statusCode = 201;
              },
              (error) => {
                switch (error && error.code) {
                  case 'EEXIST':
                    res.statusCode = 409;
                    break;
                  case 'LIMIT_EXCEEDED':
                    res.statusCode = 413;
                    break;
                  default:
                    res.statusCode = 500;
                    break;
                }
              }
          )
          .finally(() => {
            res.end();
          });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
