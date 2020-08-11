const _db = require('../helpers/db-helper')
const utils = require('../utils')
const { DetailsRowGlobalClassNames } = require('office-ui-fabric-react')

module.exports = function () {
    this.path = '/submit-answer-rating'
}

module.exports.prototype.handler = async function(req, res) {
    const client = await _db.pool.connect()
    const query = 'update answer_rating set rating=$1 where answer_id=$2 where id=$2';
    const values = [req.body.rating, req.body.answer_id]
    try {
        // see if this user has already rated the answer
        let { rows } = await client.query(`
            select id from answer_rating where student_id = $1 and answer_id = $2
        `, [req.body.uid, req.body.aid])

        if (rows.length > 0) { // if yes, then update the corresponding rating
            await client.query(`
                update answer_rating set rating=$1, date=now() where student_id = $2 
            `, [req.body.rating, req.body.uid])
        } else { // otherwise insert a line to dataset
            await client.query(`
                insert into answer_rating (rating, student_id, answer_id, date) values
                ($1, $2, $3, now())
            `, [req.body.rating, req.body.uid, req.body.aid])
        }
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