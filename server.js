// const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

const request = require('request');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const yargs = require('yargs');

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
const privateKey = fs.readFileSync(path.join(certdir, 'privkey.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(certdir, 'cert.pem'), 'utf8');

const app = express();
app.use(favicon(path.join(__dirname, 'imgs', 'favicon.ico')));
app.use(express.static(`${__dirname}./public`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let server;
if (argv.http) {
  server = http.createServer(app);
} else {
  server = https.createServer({ key: privateKey, cert: certificate }, app);
}
const io = require('socket.io')(server, {
  wsEngine: 'ws', pingTimeout: 0, pingInterval: 500, origins: '*:*',
});

const utils = require('./utils');
const prodConfig = require('./webpack.prod.js');
const devConfig = require('./webpack.dev.js');

const { Handlers } = new require('./eventHandlers');

if (mode === 'dev') {
  compiler = webpack(devConfig);
} else {
  compiler = webpack(prodConfig);
}
server.listen(PORT, () => {
  process.stdout.write(JSON.stringify({
    event: 'starting-server',
    port: PORT,
  }));
});

const options = {};
app.use(
  middleware(compiler, options),
);

app.use(require('webpack-hot-middleware')(compiler));

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

let count = 0;
// websocket communication handlers
io.on('connection', (socket) => {
  count += 1;
  logger.info(JSON.stringify({
    connection_id: socket.id,
    type: 'socketio-new-connection',
    time: utils.getDate(),
    total_users: count,
  }));
  socket.on('disconnect', () => {
    count -= 1;
    logger.info(JSON.stringify({
      connection_id: socket.id,
      type: 'socketio-disconnect',
      time: utils.getDate(),
      total_users: count,
    }));
  });

  // chatbot
  socket.on('ask-bob', async (msg) => {
    io.emit('new-chat', msg);

    //    const st = performance.now();
    try {
      const data = await utils.postData('http://localhost:5005/webhooks/rest/webhook', {
        message: msg.chat.text,
        sender: msg.conversationID,
      });

      data.forEach((m) => {
        /**
                 * transform rasa bob msg -> chat format
                 */
        const bobmsg = {
          conversationID: m.recipient_id,
          chat: {
            ...m.custom,
            user: {
              username: 'bob',
              userid: -1,
            },
          },
        };

        if (m.text) {
          bobmsg.chat.text = m.text;
        }
        if (m.custom === undefined) {
          bobmsg.chat.type = 'chat';
        }
        logger.info(bobmsg);
        io.emit('bob-msg', bobmsg);
      });
    } catch (err) {
      logger.error(JSON.stringify({
        event: 'ask-bob',
        error: err.stack,
        time: utils.getDate(),
      }));
    }
    // (req, res) => EH.registerQuestionToHistory(body)
  });
});

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

/**
 * Set up routers
 */
const routesPath = path.join(__dirname, 'routes');

fs.readdirSync(routesPath).forEach((filename) => {
  // get filepath from filename and routes path
  const fp = path.join(routesPath, filename);
  const R = require(fp);
  const router = new R();
  app.post(router.path, (req, res) => router.handler(req, res));
});

// on terminating the process
process.on('SIGINT', () => {
  logger.info(JSON.stringify({
    event: 'close-server',
    time: utils.getDate(),
  }));
  process.exit();
});
