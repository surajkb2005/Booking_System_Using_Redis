const redis = require('../config/redisClient');

exports.cleanRedisCache = async (req, res) => {
    try {
        const keys = await redis.keys('[abc][1-4]'); // your seat pattern

        for (const key of keys) {
            await redis.del(key);
        }

        res.json({
            success: true,
            deleted: keys.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};