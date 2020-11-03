const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const http = require('http');
const https = require('https');
const yargs = require('yargs');
const logger = require('./logger');
var cors = require('cors');

const { argv } = yargs
  .option('dev', {
    description: 'start in dev mot',
    type: 'boolean',
  })
  .option('port', {
    description: 'select the server port',
    type: 'number',
  })
  .option('certdir', {
    description: 'the directory of the certificate',
    type: 'string',
  })
  .option('http', {
    description: 'select the server port',
    type: 'boolean',
  });

let compiler;
let mode = 'prod';
let PORT = 5000;

if (argv.dev) {
  mode = 'dev';
}
if (argv.port) {
  PORT = argv.port;
}
let certdir = 'ssl-certs';
if (argv.certdir) {
  certdir = argv.certdir;
}

const app = express();
app.use(favicon(path.join(__dirname, 'imgs', 'favicon.ico')));
app.use(express.static(`${__dirname}./public`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

let server;
if (argv.http) {
  server = http.createServer(app);
} else {
  const privateKey = fs.readFileSync(path.join(certdir, 'privkey.pem'), 'utf8');
  const certificate = fs.readFileSync(path.join(certdir, 'cert.pem'), 'utf8');
  server = https.createServer({ key: privateKey, cert: certificate }, app);
}

const utils = require('./utils');
const prodConfig = require('./webpack.prod.js');
const devConfig = require('./webpack.dev.js');

if (mode === 'dev') {
  compiler = webpack(devConfig);
} else {
  compiler = webpack(prodConfig);
}

const options = {};

// set up server
server.listen(PORT, () => {
  process.stdout.write(JSON.stringify({
    event: 'starting-server',
    port: PORT,
  }));
});
app.use(
  middleware(compiler, options),
);
app.use(require('webpack-hot-middleware')(compiler));

// normal routes with POST/GET
app.get('*', (req, res, next) => {
  const filename = path.join(compiler.outputPath, 'index');

  compiler.outputFileSystem.readFile(filename, async (err, data) => {
    if (err) {
      return next(err);
    }
    res.set('content-type', 'text/html');
    res.send(data);
    res.end();
    return undefined;
  });
});

// on terminating the process
process.on('SIGINT', () => {
  logger.info(JSON.stringify({
    event: 'close-server',
    time: utils.getDate(),
  }));
  process.exit();
});
