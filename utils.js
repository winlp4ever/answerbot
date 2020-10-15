const fetch = require('node-fetch')

var getDate = function() {
    var today = new Date();
    var dd = today.getDate();

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
    getDate: getDate,
    postData: postData
}
