const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs').promises;

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      fs.unlink(filepath)
          .catch((error) => {
            if (error.code === 'ENOENT') {
              res.statusCode = 404;
            }
          })
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
