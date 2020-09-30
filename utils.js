const path = require('path');
const request = require('request');
const AWS = require('aws-sdk');

AWS.config.loadFromPath(path.join(__dirname, 'aws-credentials', 'accessKeys.json'));

const uploadToS3 = function (file, fn, callback) {
  const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
  const base64Data = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const uploadParams = {
    Bucket: 'course-recording-q1-2020-taii',
    Key: `qas/${fn}`,
    Body: base64Data,
    ContentEncoding: 'base64',
  };

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.log('Error', err);
      callback({ err });
    } if (data) {
      console.log('Upload Success', data.Location);
      callback({ link: data.Location });
    }
  });
};

const getNews = function (q, callback) {
  const azure = require('./azure-credentials/config');
  const requestParams = {
    method: 'GET',
    uri: azure.endpoint,
    headers: {
      'Ocp-Apim-Subscription-Key': azure.key,
    },
    qs: {
      q,
      mkt: azure.mkt,
    },
    json: true,
  };
  request(requestParams, (error, response, body) => {
    if (error) {
      console.error('error:', error);
      return;
    }
    return callback(body);
  });
};

const getDate = function () {
  let today = new Date();
  let dd = today.getDate();

  let mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  if (dd < 10) {
    dd = `0${dd}`;
  }

  if (mm < 10) {
    mm = `0${mm}`;
  }
  today = `${mm}-${dd}-${yyyy} ${
    [
      today.getHours(),
      today.getMinutes(),
      today.getSeconds(),
    ].join(':')}`;
  return today;
};

module.exports = {
  uploadToS3,
  getNews,
  getDate,
};
