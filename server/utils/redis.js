const Redis = require('ioredis');
const redisOpts = require('../config/config.json')['redis'];
const redisClient = new Redis(redisOpts);

module.exports = redisClient
