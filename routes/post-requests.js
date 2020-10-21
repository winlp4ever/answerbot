const _db = require('../helpers/db-helper')
const utils = require('../utils')

module.exports = function () {
    this.path = '/post-requests/:userID'
}

module.exports.prototype.handler = async function(req, res) {
    try {
        let data = await utils.request(`http://vscode.theaiinstitute.ai:6710/message/user/${req.params.userID}`, 'get');
        res.status(200).json({messages: data.messages});
    } catch (err) {
        res.status(500).json({error: err.stack});
    }
}