const redisClient = require('../config/redisClient');

exports.cleanRedisCache = async (req, res) => {
    try {
        await redisClient.flushAll();
        res.status(200).json({ message: "Redis cache cleaned successfully" });
    } catch (error) {
        console.error("Error cleaning Redis cache:", error);
        res.status(500).json({ error: "Failed to clean Redis cache" });
    }
};