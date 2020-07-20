//const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
//const http = require('http');
const https = require('https')
const {performance} = require('perf_hooks');

const request = require('request')

var privateKey  = fs.readFileSync(path.join('ssl-certs', 'key.key'), 'utf8');
var certificate = fs.readFileSync(path.join('ssl-certs', 'cer.cer'), 'utf8');

const utils = require('./utils');

// set up server
var app = express();
app.use(favicon(path.join(__dirname, 'imgs', 'favicon.ico')));
app.use(express.static(__dirname + './public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const prodConfig = require('./webpack.prod.js');
const devConfig = require('./webpack.dev.js');
const options = {};
var PORT = 5000;

var mode = 'prod';
if (process.argv.length < 3) mode = 'prod';
if (process.argv[2] != 'prod' & process.argv[2] != 'dev') {
    console.error(JSON.stringify({
        event: 'launching-script',
        error: 'Wrong mode - only dev or prod is accepted!'
    }))
    process.exit(1)
};
mode = process.argv[2];
if (mode == 'prod') {
    compiler = webpack(prodConfig);
    PORT = 5000;
}
else compiler = webpack(devConfig);

const server = new https.createServer({key: privateKey, cert: certificate}, app);
const io = require('socket.io')(server, { wsEngine: 'ws',pingTimeout: 0, pingInterval: 500, origins: '*:*' });

server.listen(PORT, () => {
    console.log(JSON.stringify({
        event: 'starting-server',
        port: PORT
    }))
});
app.use(
    middleware(compiler, options)
);
app.use(require('webpack-hot-middleware')(compiler));

/** 
* setup postgres for backend data services
*/
const Handlers = new require('./eventHandlers').Handlers
const EH =  new Handlers()
var count = 0

// websocket communication handlers
io.on('connection', function(socket){
    count ++;
    console.log(JSON.stringify({
        connection_id: socket.id,
        type: 'socketio-new-connection',
        time: utils.getDate(),
        total_users: count,
    }))
    socket.on('disconnect', function(){
        count --;
        console.log(JSON.stringify({
            connection_id: socket.id, 
            type: 'socketio-disconnect',
            time: utils.getDate(),
            total_users: count,
        }))
    })

    // chatbot
    socket.on('ask-bob', msg => {
        io.emit('new-chat', msg);

        let st = performance.now()

        request.post('http://localhost:6800/ask-bob', 
            {
                json: msg
            }, 
            (error, response, body) => {
                if (error) {
                    console.error(JSON.stringify({
                        event: 'ask-bob',
                        error: error.stack,
                        time: utils.getDate()
                    }))
                    return
                }

                console.info(JSON.stringify({
                    event: 'ask-bob',
                    time: utils.getDate(),
                    responseRetrievalTimeMilliseconds: performance.now() - st,
                    userid: msg.conversationID
                }))

                io.emit('bob-msg', body);
                (req, res) => EH.registerQuestionToHistory(body)
            }
        )
    })
});

// normal routes with POST/GET 
app.get('*', (req, res, next) => {
    var filename = path.join(compiler.outputPath,'index');
    
    compiler.outputFileSystem.readFile(filename, async (err, data) => {
        if (err) {
            return next(err);
        }
        res.set('content-type','text/html');
        res.send(data);
        res.end();
    });
});

app.post('/submit-answer-rating', (req, res) => EH.submitAnswerRating(req, res))

app.post('/post-bob-msg', (req, res) => EH.postBobMsg(req, res))

app.post('/post-asked-requests', (req, res) => EH.postAskRequests(req, res))

app.post('/post-req-answer', (req, res) => EH.postReqAnswer(req, res))

app.post('/post-asked-questions', (req, res) => EH.postAskedQuestions(req, res))

app.post('/ask-teachers', (req, res) => EH.askTeachers(req, res))

// on terminating the process
process.on('SIGINT', _ => {
    console.log(JSON.stringify({
        event: 'close-server',
        time: utils.getDate()
    }))
    process.exit();
})