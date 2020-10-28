const utils = require('../utils')

module.exports = function () {
    this.path = '/post-conversation/:firstMessageID'
}

module.exports.prototype.handler = async function(req, res) {
    try {
        let data = await utils.request(`http://vscode.theaiinstitute.ai:6710/message/conversation/${req.params.firstMessageID}`, 'get');
        res.status(200).json({messages: data.messages});
    } catch (err) {
        res.status(500).json({error: err.stack});
    }
}