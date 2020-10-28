const socketio = require('socket.io');
const utils = require('../utils');
const { performance } = require('perf_hooks');
const logger = require('../logger');

module.exports = (server) => {
    var count = 0;
    const io = socketio(server, {
        wsEngine: 'ws', pingTimeout: 0, pingInterval: 500, origins: '*:*',
    });
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
        socket.on('ask-bob', async msg => {
            io.emit('new-chat', msg);
        
            let st = performance.now()
            try {
                let data = await utils.postData('http://vscode.theaiinstitute.ai:5005/webhooks/rest/webhook', {
                    message: msg.chat.text,
                    sender: msg.conversationID
                });

                let corpusID = msg.courseID;
        
                data.forEach(m => {
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
        });
    });   
    return io;  
}