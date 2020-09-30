const path = require('path');

// const cliProgress = require('cli-progress');
const request = require('request');
const AWS = require('aws-sdk');
const fetch = require('node-fetch');

const uploadToS3 = function (file, fn, callback) {
  AWS.config.loadFromPath(path.join(__dirname, 'aws-credentials', 'accessKeys.json'));
  const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
  const base64Data = new Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');
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
  const request_params = {
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
  request(request_params, (error, response, body) => {
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

const postData = async function (endpoint, dict = {}) {
  const response = await fetch(endpoint, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dict),
  });
  const data = await response.json();
  return data;
};

module.exports = {
  uploadToS3,
  getNews,
  getDate,
  postData,
};
