const winston = require('winston');
const path = require('path');
const LOGPATH = 'log';

module.exports = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.File({ filename: path.join(LOGPATH, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(LOGPATH, 'combined.log') }),
    ],
});