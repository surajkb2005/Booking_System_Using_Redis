const client = require('../config/redisClient');

exports.createFlight = async (req, res) => {
    const { id, airline, destination, price } = req.body;
    const key = `flight:${id}`;

    console.log(` Request to SAVE: ${key} -> ${airline}`);

    try {
        // We use individual HSET commands to be 100% compatible with your server
        await client.hSet(key, 'airline', airline);
        await client.hSet(key, 'destination', destination);
        await client.hSet(key, 'price', price);
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
            const data = await client.hGetAll(key);
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

// app.post('/api/book', async (req, res) => {
//     const { seatId, user } = req.body;
//     console.log(` Booking Attempt: [${user}] wants [${seatId}]...`);

//     try {
//         // --- REAL REDIS ATOMIC LOCK ---
//         // SET key value NX (Not Exists) EX 20 (Expire in 20s)
//         const result = await client.set(seatId, user, {
//             NX: true,
//             EX: 20
//         });

//         if (result === 'OK') {
//             console.log(`   ✅ SUCCESS: Locked for ${user}`);
//             res.json({ success: true, message: "🎉 Booking Confirmed!" });
//         } else {
//             // Check who owns it
//             const owner = await client.get(seatId);
//             const ttl = await client.ttl(seatId);
//             console.log(`   ❌ FAILED: Blocked by lock owned by ${owner}`);
//             res.json({
//                 success: false,
//                 message: `❌ Failed! Seat held by ${owner}`,
//                 ttl: ttl
//             });
//         }
//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// });
