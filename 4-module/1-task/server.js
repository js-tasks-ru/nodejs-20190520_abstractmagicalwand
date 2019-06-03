const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const stream = require('stream');
const {promisify} = require('util');
const NestedPathError = require('./NestedPathError');

const server = new http.Server();
const pipeline = promisify(stream.pipeline);

async function getFile(req, res, filepath, pathname) {
  if (pathname.includes('/')) {
    throw new NestedPathError();
  }

  const fileStat = await fs.promises.stat(filepath);
  if (!fileStat.isFile()) {
    return;
  }

  await pipeline(fs.createReadStream(filepath, {encoding: 'utf-8'}), res);
}

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      getFile(req, res, filepath, pathname)
          .catch((error) => {
            switch (error.code) {
              case 'NESTED_PATH':
                res.statusCode = 400;
                break;
              case 'ENOENT':
                res.statusCode = 404;
                break;
              default:
                res.statusCode = 500;
                break;
            }
          })
          .then(() => {
            res.end();
          });
      break;
    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
