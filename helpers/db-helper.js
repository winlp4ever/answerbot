/** 
* setup postgres for backend data services
*/
const dbConfig = require('../db-credentials/config.js');
const { Pool } = require('pg');
const pool = new Pool(dbConfig);

module.exports = {
    pool : pool
}