const _db = require('../helpers/db-helper')
const utils = require('../utils')

module.exports = function () {
    this.path = '/register-question-to-history'
}

module.exports.prototype.handler = async function(req, res) {
    /**
     * Register a question with its answer to history after Bob responds
     */
    if (msg.chat.type == 'answer') if (msg.chat.answer) {
        let client = await _db.pool.connect()
        const query = `
            select * from bob_history_add_question ($1, $2, $3, $4);
        `
        const values = [msg.conversationID, msg.chat.answer.qid, msg.chat, msg.chat.original_question]
        try {
            await client.query(query, values)
            console.log(JSON.stringify({
                event: 'register-to-history', 
                status: 'ok', 
                question: msg.chat.original_question,
                userid: msg.conversationID,
                time: utils.getDate()
            }))
            res.json({status: 0})
        } catch (err) {
            console.error(JSON.stringify({
                event: 'register-to-history', 
                error: err.stack,
                userid: msg.conversationID,
                time: utils.getDate()
            }))
            res.json({status: 1, err: err.stack})
        } finally {
            client.release()
        }
    }
}