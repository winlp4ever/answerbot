const _db = require('../helpers/db-helper')
const utils = require('../utils')
const request = require('request')

module.exports = function () {
    this.path = '/bookmark-answer'
}

module.exports.prototype.handler = async function(req, res) {
    /**
     * bookmark question
     */
    let client = await _db.pool.connect()
    try {
        if (req.body.bookmarked) {
            await client.query(`
                delete from answer_bookmarks where question = $1 and student_id = $2
            `, [req.body.question, req.body.uid])
        } else {
            await client.query(`
                insert into answer_bookmarks (question, student_id) values (
                    $1, $2
                )
            `, [req.body.question, req.body.uid])
        }
    } catch (err) {
        res.json({status: 1, err: err.stack})
    } finally {
        client.release()
    }
}