const _db = require('../helpers/db-helper')
const utils = require('../utils')
const request = require('request')

module.exports = function () {
    this.path = '/ask-teachers'
}

module.exports.prototype.handler = async function(req, res) {
    /**
     * Send a question request to teachers
     */
    request.post('http://localhost:6700/new-question', {
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
}