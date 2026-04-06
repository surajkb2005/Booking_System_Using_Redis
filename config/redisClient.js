//Booking_System_Using_Redis/config/redisClient.js
const dotenv = require('dotenv');
dotenv.config();

// For Upstash Redis connection
const { Redis } = require('@upstash/redis');

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = redis;
