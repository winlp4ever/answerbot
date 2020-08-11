const _db = require('../helpers/db-helper')
const utils = require('../utils')
const request = require('request')

module.exports = function () {
    this.path = '/post-req-answer'
}

module.exports.prototype.handler = async function(req, res) {
    /**
     * Search for answers to a specific question this.requests
     */
    request.post('http://localhost:6700/post-answers', {
        json: {
            qid: req.body.qid
        }
        }, (error, response, msg) => {
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
                    time: utils.getDate()
                }))
                res.json({status: 1, err: error_.stack})
                return
            }
            
            res.json({status: 0, answer: body_.answer})
        })
    })
}