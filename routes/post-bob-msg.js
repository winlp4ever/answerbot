const _db = require('../helpers/db-helper')

module.exports = function () {
    this.path = '/post-bob-msg'
}

module.exports.prototype.handler = async function(req, res) {
    /**
     * Retrieve Bob's message corresponding to user action and result
     */
    const client = await _db.pool.connect()
    const query = `
        select * 
        from bob_message
        inner join action_message
        on bob_message.id = action_message.message_id
        where action_message.action_id = $1
    `
    const values = [req.body.actionID]
    try {
        let { rows } = await client.query(query, values)
        res.json({status: 0, msg: rows[Math.floor(Math.random() * rows.length)].message_text})
    } catch (err) {
        console.error(JSON.stringify({
            err: err.stack
        }))
        res.json({status: 1, err: err.stack})
    } finally {
        client.release()
    }
}