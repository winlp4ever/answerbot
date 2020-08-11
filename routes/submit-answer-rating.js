const _db = require('../helpers/db-helper')
const utils = require('../utils')

module.exports = function () {
    this.path = '/submit-answer-rating'
}

module.exports.prototype.handler = async function(req, res) {
    const client = await _db.pool.connect()
    const query = 'update answer_temp set answer_rating=$1 where id=$2';
    const values = [req.body.rating, req.body.answer_id]
    try {
        await client.query(query, values)
        res.json({status: 0})
    } catch (err) {
        console.error(JSON.stringify({
            event: 'submit-answer-rating',
            answer_id: req.body.answer_id,
            error: err.stack,
            time: utils.getDate()
        }))
        res.json({status: 1, err: err.stack});
    } finally {
        client.release()
    }
}