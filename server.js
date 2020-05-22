//const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const http = require('http');

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
    console.error('Wrong mode - only dev or prod is accepted!');
    return;
};
mode = process.argv[2];
if (mode == 'prod') {
    compiler = webpack(prodConfig);
    PORT = 5000;
}
else compiler = webpack(devConfig);

const server = new http.Server(app);
const io = require('socket.io')(server, { wsEngine: 'ws' });

server.listen(PORT, () => {
    console.log(`listening to port ${PORT}`)
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

var usersPath = './users'

var count = 0;
var users = JSON.parse(fs.readFileSync(path.join(usersPath, 'users.json'))).users;
var chats = {};

// websocket communication handlers
io.on('connection', function(socket){
    count ++;
    console.log(`${count} user connected with id: ${socket.id}`);
    socket.on('disconnect', function(){
        count --;
        console.log(`1 user disconnected, rest ${count}`);
    });

    // chatbot
    socket.on('ask-bob', msg => {
        io.emit('ask-bob', msg);
        io.emit('new-chat', msg);
    })
    socket.on('bob-msg', msg => {
        io.emit('bob-msg', msg);
    })
    socket.on('ask-for-hints-bob', msg => {
        io.emit('ask-for-hints-bob', msg);
    })
    socket.on('bob-hints', msg => {
        io.emit('bob-hints', msg);
    })

    // 3wa websocket
    let io_3wa = require('socket.io-client')('http://learning.3wa.pixelsass.fr/bob-ia', 
        {
            extraHeaders:
            {
                token:'eaqYvt4a8emwgQwdXzpwELcRYnZxwnTJ8YABjLJg4W6Pw2ruz9Z2gsuVn2bRkaNm'
            }
        })

    io_3wa.on('event_login', msg => {
        let query = `
            insert into activities (studentid, activitytype, record) 
            values ($1, 'login', '{}')
        `
        let values = [msg]
        client.query(query, values, (err, response) => {
            if (err) {
                console.log(err.stack)
            } else {
                console.log(response)
            }
        })
    })
    io_3wa.on('event_submit', msg => {
        let query = `
            insert into activities (studentid, activitytype, record)
            values ($1, 'submit', $2)
        `
        let values = [msg.id_user, JSON.stringify(msg)]
        client.query(query, values, (err, response) => {
            if (err) {
                console.log(err.stack)
            } else {
                console.log(response)
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

app.post('/login', (req, res) => {
    console.log(req.body.username in users);
    if (req.body.username in users) if (req.body.pass == users[req.body.username].password) {
        let profile = JSON.parse(JSON.stringify(users[req.body.username]));
        delete profile.password;
        console.log({...profile, username: req.body.username});
        res.json({...profile, username: req.body.username});
        return;
    }
    res.json({err: 'wrong username or password'});
})

app.post('/get-user-data', (req, res) => {
    res.json({username: req.body.username, color: users[req.body.username].color});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
})



app.post('/admin-verify', (req, res) => {
    if (req.body.pass != '2311') res.json({answer: 'n'});
    res.json({
        answer: 'y'
    })
})

app.post('/post-img', (req, res) => {
    utils.uploadToS3(req.body.file, req.body.fn, msg => {res.json(msg)});
})

app.post('/submit-answer-rating', (req, res) => {
    const query = 'update answer_temp set answer_rating=$1 where id=$2';
    const values = [req.body.rating, req.body.answer_id]
    client.query(query, values, (err, response) => {
        if (err) {
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

app.post('/post-news', (req, res) => {
    const query = 'web development';
    utils.getNews(query, (ans)=> {
        console.log(ans);
        res.json(ans);
    })
})

app.post('/post-err-code', (req, res) => {
    
})

// on terminating the process
process.on('SIGINT', _ => {
    console.log('now you quit!');
    process.exit();
})