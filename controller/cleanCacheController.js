exports.cleanRedisCache = async (req, res) => {
    try {
        const keys = await redis.keys('*'); // get ALL keys

        if (keys.length === 0) {
            return res.json({ success: true, deleted: 0 });
        }

        await redis.del(...keys); // delete all in one call

        res.json({
            success: true,
            deleted: keys.length,
            keys: keys
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};