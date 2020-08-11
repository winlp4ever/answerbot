const _db = require('../helpers/db-helper')
const utils = require('../utils')
const request = require('request')

module.exports = function () {
    this.path = '/post-asked-requests'
}

module.exports.prototype.handler = async function(req, res) {
    /**
     * return list of all questions requests posed to teachers by a specific user
     */
    request.post('http://localhost:6700/post-user-questions', {
        json: {
            userid: req.body.userid,
        }
        }, (error, response, msg) => {
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
        res.json({status: 0, questions: msg.questions})
    })
}