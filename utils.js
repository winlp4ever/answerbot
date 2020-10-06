const fetch = require('node-fetch')

var getDate = function() {
    var today = new Date();
    var dd = today.getDate();

    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd='0'+dd;
    } 

    if (mm < 10) {
        mm='0'+mm;
    } 
    today = mm+'-'+dd+'-'+yyyy + ' ' +
        [
            today.getHours(),
            today.getMinutes(),
            today.getSeconds()
        ].join(':');;
    return today
}

var postData = async function (endpoint, dict={}) {
    let response = await fetch(endpoint, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dict)
    });
    let data = await response.json();
    return data;
}

module.exports = {
    getDate: getDate,
    postData: postData
}