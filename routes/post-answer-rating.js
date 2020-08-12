const _db = require('../helpers/db-helper')
const utils = require('../utils')

module.exports = function () {
    this.path = '/post-answer-rating'
}

module.exports.prototype.handler = async function(req, res) {
    let client = await _db.pool.connect()
    try {
        let { rows } = await client.query(`
            select rating from answer_rating where answer_id = $1 and student_id = $2
        `, [req.body.aid, req.body.uid])
        if (rows.length > 0) {
            res.json({status: 0, rating: rows[0].rating})
        } else {
            res.json({status: 0, rating: 0})
        }
    } catch (err) {
        console.error(JSON.stringify({
            err: err.stack
        }))
        res.json({status: 1, err: err.stack})
    } finally {
        client.release()
    }
}