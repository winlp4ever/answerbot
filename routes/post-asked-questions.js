const _db = require('../helpers/db-helper')
const utils = require('../utils')

module.exports = function () {
    this.path = '/post-asked-questions'
}

module.exports.prototype.handler = async function(req, res) {
    /**
     * return list of all questions asked by a specific user (question history)
     */
    if (req.body.userid == -1) return
    let client = await _db.pool.connect()
    const query = `
        select * 
        from bob_history
        where userid = $1 
        order by date desc, id desc;
    `
    const values = [req.body.userid]
    try {
        let { rows } = await client.query(query, values)
        res.json({status: 0, questions: rows})
        console.log(JSON.stringify({
            event: 'post-asked-question',
            status: 0,
            userid: req.body.userid,
            time: utils.getDate()
        }))
    } catch (err) {
        res.json({status: 1, error: err.stack})
        console.error(JSON.stringify({
            event: 'post-asked-question',
            status: 1,
            error: err.stack,
            userid: req.body.userid,
            time: utils.getDate()
        }))
    } finally {
        client.release()
    }
}