const path = require('path');
const fs = require('fs');
const _cliProgress = require('cli-progress');
const request = require('request');
var AWS = require('aws-sdk');
AWS.config.loadFromPath(path.join(__dirname, 'aws-credentials', 'accessKeys.json'));
const azure = require('./azure-credentials/config');

var uploadToS3 = function(file, fn, callback) {
    s3 = new AWS.S3({apiVersion: '2006-03-01'});
    const base64Data = new Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    var uploadParams = {
        Bucket: 'course-recording-q1-2020-taii', 
        Key: `qas/` + fn, 
        Body: base64Data,
        ContentEncoding: 'base64',
    };

    s3.upload (uploadParams, function (err, data) {
        if (err) {
            console.log("Error", err);
            callback({err: err});
        } if (data) {
            console.log("Upload Success", data.Location);
            callback({link: data.Location});
        }
    });
}

var getNews = function(q, callback) {
    let request_params = {
        method: 'GET',
        uri: azure.endpoint,
        headers: {
            'Ocp-Apim-Subscription-Key': azure.key
        },
        qs: {
            q: q,
            mkt: azure.mkt
        },
        json: true
    }
    request(request_params, function (error, response, body) {
        if (error) {
            console.error('error:', error)
            return
        }
        return callback(body);
    })
}

module.exports = {
    uploadToS3: uploadToS3,
    getNews: getNews
}