const client = require('../config/redisClient');

exports.createFlight = async (req, res) => {
    const { id, airline, destination, price } = req.body;
    const key = `flight:${id}`;

    console.log(` Request to SAVE: ${key} -> ${airline}`);

    try {
        // We use individual HSET commands to be 100% compatible with your server
        await client.hset(key, {
            airline,
            destination,
            price
        });
        console.log(`   ✅ Saved to Database!`);
        res.json({ success: true, message: `Flight ${id} saved!` });
    } catch (e) {
        console.log(`   ❌ Save Failed: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};

exports.getFlights = async (req, res) => {
    try {
        // SCAN for all keys starting with 'flight:'
        const keys = await client.keys('flight:*');
        const flights = [];

        for (const key of keys) {
            const data = await client.hgetall(key);
            flights.push({ id: key.replace('flight:', ''), ...data });
        }
        res.json(flights);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.deleteFlight = async (req, res) => {
    const key = `flight:${req.params.id}`;
    console.log(` Request to DELETE: ${key}`);
    await client.del(key);
    res.json({ success: true });
};
