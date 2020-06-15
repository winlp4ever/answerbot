// 3wa websocket
let io_3wa = require('socket.io-client')('http://learning.3wa.pixelsass.fr/bob-ia', 
{
    extraHeaders:
    {
        token:'eaqYvt4a8emwgQwdXzpwELcRYnZxwnTJ8YABjLJg4W6Pw2ruz9Z2gsuVn2bRkaNm'
    }
})

io_3wa.on('event_login', msg => {
console.log(msg)
let query = `
    insert into activities (studentid, activitytype, record, date) 
    values ($1, 'login', '{}', NOW()::date)
`
let values = [msg]
client.query(query, values, (err, response) => {
    if (err) {
        console.log(err.stack)
    } else {
        console.log('ok')
    }
})
})
io_3wa.on('event_submit', msg => {
console.log(msg)
let query = `
    insert into activities (studentid, activitytype, record, status, exerciseid, date)
    values ($1, 'submit', $2, $3, $4, NOW()::date)
`
let values = [msg.id_user, JSON.stringify(msg), msg.status, msg.id_exercice]
client.query(query, values, (err, response) => {
    if (err) {
        console.log(err.stack)
    } else {
        console.log('ok')
    }
})
})