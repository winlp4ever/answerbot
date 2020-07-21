/**
 * Event Handlers, or Navigators, this class sets up postGres connection to be used through out the server's session
 */

/** @constructor */
function Handlers () {
    const dbConfig = require('./db-credentials/config.js');
    const {Client} = require('pg');
    this.client = new Client(dbConfig);
    this.client.connect();
    this.request = require('request')
    this.utils = require('./utils')
}

Handlers.prototype.postAnswerRating = function (req, res) {
    /**
     * Post user answer rating
     */
}

Handlers.prototype.submitAnswerRating = function (req, res) {
    /**
     * Update answer_rating
     */
    const query = 'update answer_temp set answer_rating=$1 where id=$2';
    const values = [req.body.rating, req.body.answer_id]
    this.client.query(query, values, (err, response) => {
        if (err) {
            console.error(JSON.stringify({
                event: 'submit-answer-rating',
                answer_id: req.body.answer_id,
                error: err.stack,
                time: this.utils.getDate()
            }))
            res.json({status: err.stack});
        } else {
            res.json({status: 'ok'});
        }
    })
}

Handlers.prototype.postBobMsg = function (req, res) {
    /**
     * Send a message to Bob
     */
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
    this.client.query(query, values, (err, response) => {
        if (err) {
            res.json({status: err.stack});
        } else {
            res.json({status: 'ok', msg: response.rows[Math.floor(Math.random() * response.rows.length)].message_text});
        }
    })
}

Handlers.prototype.postAskRequests = function (req, res) {
    /**
     * return list of all questions this.requests posed to teachers by a specific user
     */
    this.request.post('http://localhost:6700/post-user-questions', {
        json: {
            userid: req.body.userid,
        }
        }, (error, response, msg) => {
        if (error) {
            console.error(JSON.stringify({
                url: 'http://localhost:6700/post-user-questions',
                error: error.stack,
                userid: req.body.userid,
                time: this.utils.getDate()
            }))
            res.json({status: 1, err: error.stack})
            return
        }
        console.log(JSON.stringify({
            url: 'http://localhost:6700/post-user-questions',
            userid: req.body.userid,
            status: 'ok',
            time: this.utils.getDate()
        }))
        res.json({status: 0, questions: msg.questions})
    })
}

Handlers.prototype.postReqAnswer = function (req, res) {
    /**
     * Search for answers to a specific question this.requests
     */
    this.request.post('http://localhost:6700/post-answers', {
        json: {
            qid: req.body.qid
        }
        }, (error, response, msg) => {
        if (error) {
            console.error(JSON.stringify({
                url: 'http://localhost:6700/post-answers',
                error: error.stack,
                qid: req.body.qid,
                time: this.utils.getDate()
            }))
            res.json({status: 1, err: error.stack})
            return
        }
        this.request.post('http://localhost:6700/post-answer', {
            json: {
                aid: msg.answers[0].id
            }
            }, (error_, response_, body_) => {
            if (error_) {
                console.error(JSON.stringify({
                    url: 'http://localhost:6700/post-answers',
                    error: error_.stack,
                    aid: msg.answers[0].id,
                    time: this.utils.getDate()
                }))
                res.json({status: 1, err: error_.stack})
                return
            }
            
            res.json({status: 0, answer: body_.answer})
        })
    })
}

Handlers.prototype.postAskedQuestions = function (req, res) {
    /**
     * return list of all questions asked by a specific user (question history)
     */
    if (req.body.userid == -1) return
    const query = `
        select * 
        from bob_history
        where userid = $1 
        order by date desc, id desc;
    `
    const values = [req.body.userid]
    this.client.query(query, values, (err, response) => {
        if (err) {
            console.error(JSON.stringify({
                event: 'post-asked-question',
                error: err.stack,
                userid: req.body.userid,
                time: this.utils.getDate()
            }))
            res.json({status: err.stack});
        } else {
            console.log(JSON.stringify({
                event: 'post-asked-question',
                status: 'ok',
                userid: req.body.userid,
                time: this.utils.getDate()
            }))
            res.json({status: 'ok', questions: response.rows});
        }
    })
}

Handlers.prototype.askTeachers = function (req, res) {
    /**
     * Send a question this.request to teachers
     */
    this.request.post('http://localhost:6700/new-question', {
            json: {
                userid: req.body.userid,
                question: req.body.q
            }
        }, (error, response, msg) => {
        if (error) {
            console.error(JSON.stringify({
                url: 'http://localhost:6700/new-question',
                error: error,
                userid: req.body.userid,
                question: req.body.q,
                time: this.utils.getDate()
            }))
            res.json({status: 1, err: error.stack})
            return
        }
        console.log(JSON.stringify({
            url: 'http://localhost:6700/new-question',
            status: 'ok',
            userid: req.body.userid,
            question: req.body.q,
            time: this.utils.getDate()
        }))
        res.json({status: 0})
    })
}

Handlers.prototype.registerQuestionToHistory = function (msg) {
    /**
     * Register a question with its answer to history after Bob responds
     */
    if (msg.chat.type == 'answer') if (msg.chat.answer) {
        const query = `
            select * from bob_history_add_question ($1, $2, $3, $4);
        `
        const values = [msg.conversationID, msg.chat.answer.qid, msg.chat, msg.chat.original_question]
        this.client.query(query, values, (err, res) => {
            if (err) {
                console.error(JSON.stringify({
                    event: 'register-to-history', 
                    error: err.stack,
                    userid: msg.conversationID,
                    time: this.utils.getDate()
                }))
            } else {
                console.log(JSON.stringify({
                    event: 'register-to-history', 
                    status: 'ok', 
                    question: msg.chat.original_question,
                    userid: msg.conversationID,
                    time: this.utils.getDate()
                }))
            }
        })
    }
}

module.exports = {
    Handlers: Handlers
}