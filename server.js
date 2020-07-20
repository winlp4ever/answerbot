//const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const http = require('http');
const https = require('https')

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
    console.error({
        event: 'launching-script',
        error: 'Wrong mode - only dev or prod is accepted!'
    });
    process.exit(1);
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
const dbConfig = require('./db-credentials/config.js');
const {Pool, Client} = require('pg');
const pool = new Pool(dbConfig);
const client = new Client(dbConfig);
client.connect();

// setup backend data for servicese
var count = 0;

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
            io.emit('bob-msg', body);
            if (body.chat.type == 'answer') if (body.chat.answer) {
                const query = `
                    select * from bob_history_add_question ($1, $2, $3, $4);
                `
                const values = [body.conversationID, body.chat.answer.qid, body.chat, body.chat.original_question]
                client.query(query, values, (err, res) => {
                    if (err) {
                        console.error(JSON.stringify({
                            event: 'register-to-history', 
                            error: err.stack,
                            userid: body.conversationID,
                            time: utils.getDate()
                        }))
                    } else {
                        console.log(JSON.stringify({
                            event: 'register-to-history', 
                            status: 'ok', 
                            question: body.chat.original_question,
                            userid: body.conversationID,
                            time: utils.getDate()
                        }))
                    }
                })
            }
        })
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

app.post('/submit-answer-rating', (req, res) => {
    const query = 'update answer_temp set answer_rating=$1 where id=$2';
    const values = [req.body.rating, req.body.answer_id]
    client.query(query, values, (err, response) => {
        if (err) {
            console.error(JSON.stringify({
                event: 'submit-answer-rating',
                answer_id: req.body.answer_id,
                error: err.stack,
                time: utils.getDate()
            }))
            res.json({status: err.stack});
        } else {
            res.json({status: 'ok'});
        }
    })
})

app.post('/post-bob-msg', (req, res) => {
    const query = `
    select * 
    from 
        bob_message
    inner join 
        action_message
    on bob_message.id = action_message.message_id
    where action_message.action_id = $1
    `
    const values = [req.body.actionID]
    client.query(query, values, (err, response) => {
        if (err) {
            res.json({status: err.stack});
        } else {
            res.json({status: 'ok', msg: response.rows[Math.floor(Math.random() * response.rows.length)].message_text});
        }
    })
})

app.post('/post-asked-requests', (req, res) => {
    request.post('http://localhost:6700/post-user-questions', {
        json: {
            userid: req.body.userid,
        }
        }, (error, response, body) => {
        if (error) {
            console.error(JSON.stringify({
                url: 'http://localhost:6700/post-user-questions',
                error: error.stack,
                userid: req.body.userid,
                time: utils.getDate()
            }))
            res.json({status: 1, err: error.stack})
            return
        }
        console.log(JSON.stringify({
            url: 'http://localhost:6700/post-user-questions',
            userid: req.body.userid,
            status: 'ok',
            time: utils.getDate()
        }))
        res.json({status: 0, questions: body.questions})
    })
})

app.post('/post-req-answer', (req, res) => {
    request.post('http://localhost:6700/post-answers', {
        json: {
            qid: req.body.qid
        }
        }, (error, response, body) => {
        if (error) {
            console.error(JSON.stringify({
                url: 'http://localhost:6700/post-answers',
                error: error.stack,
                qid: req.body.qid,
                time: utils.getDate()
            }))
            res.json({status: 1, err: error.stack})
            return
        }
        request.post('http://localhost:6700/post-answer', {
            json: {
                aid: body.answers[0].id
            }
            }, (error_, response_, body_) => {
            if (error_) {
                console.error(JSON.stringify({
                    url: 'http://localhost:6700/post-answers',
                    error: error_.stack,
                    aid: body.answers[0].id,
                    time: utils.getDate()
                }))
                res.json({status: 1, err: error_.stack})
                return
            }
            
            res.json({status: 0, answer: body_.answer})
        })
    })
})

app.post('/post-asked-questions', (req, res) => {
    // if userid == -1, which means it's an anonymous user, then return
    if (req.body.userid == -1) return
    const query = `
        select * 
        from bob_history
        where userid = $1 
        order by date desc, id desc;
    `
    const values = [req.body.userid]
    client.query(query, values, (err, response) => {
        if (err) {
            console.error(JSON.stringify({
                event: 'post-asked-question',
                error: err.stack,
                userid: req.body.userid,
                time: utils.getDate()
            }))
            res.json({status: err.stack});
        } else {
            console.log(JSON.stringify({
                event: 'post-asked-question',
                status: 'ok',
                userid: req.body.userid,
                time: utils.getDate()
            }))
            res.json({status: 'ok', questions: response.rows});
        }
    })
})

app.post('/ask-teachers', (req, res) => {
    request.post('http://localhost:6700/new-question', {
            json: {
                userid: req.body.userid,
                question: req.body.q
            }
        }, (error, response, body) => {
        if (error) {
            console.error(JSON.stringify({
                url: 'http://localhost:6700/new-question',
                error: error,
                userid: req.body.userid,
                question: req.body.q,
                time: utils.getDate()
            }))
            res.json({status: 1, err: error.stack})
            return
        }
        console.log(JSON.stringify({
            url: 'http://localhost:6700/new-question',
            status: 'ok',
            userid: req.body.userid,
            question: req.body.q,
            time: utils.getDate()
        }))
        res.json({status: 0})
    })
})

// on terminating the process
process.on('SIGINT', _ => {
    console.log(JSON.stringify({
        event: 'close-server',
        time: utils.getDate()
    }))
    process.exit();
})