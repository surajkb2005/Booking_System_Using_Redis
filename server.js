const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');

// --- 1. SETUP EXPRESS SERVER ---
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serves the HTML file

// --- 2. CONNECT TO REAL REDIS (The Black Window) ---
// We force 127.0.0.1 to avoid Windows connection issues
const client = redis.createClient({
    socket: { host: '127.0.0.1', port: 6379 }
});

client.on('error', (err) => console.log('❌ Redis Error:', err));

(async () => {
    try {
        await client.connect();
        console.log("✅ CONNECTED to Real Redis Server (Port 6379)");
    } catch (e) {
        console.log("❌ Connection Failed. Is the Black Window open?");
    }
})();

// ==========================================
// ✈️  API: FLIGHT MANAGEMENT (CRUD)
// ==========================================

// 1. Create Flight (Saves to Redis)
app.post('/api/flights', async (req, res) => {
    const { id, airline, destination, price } = req.body;
    const key = `flight:${id}`;

    console.log(`📝 Request to SAVE: ${key} -> ${airline}`);

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
});

// 2. Get All Flights (Reads from Redis)
app.get('/api/flights', async (req, res) => {
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
});

// 3. Delete Flight (Removes from Redis)
app.delete('/api/flights/:id', async (req, res) => {
    const key = `flight:${req.params.id}`;
    console.log(`🗑️ Request to DELETE: ${key}`);
    await client.del(key);
    res.json({ success: true });
});

// ==========================================
// 🎫  API: BOOKING SYSTEM (RACE CONDITION)
// ==========================================
app.post('/api/book', async (req, res) => {
    const { seatId, user } = req.body;
    console.log(`⚡ Booking Attempt: [${user}] wants [${seatId}]...`);

    try {
        // --- REAL REDIS ATOMIC LOCK ---
        // SET key value NX (Not Exists) EX 20 (Expire in 20s)
        const result = await client.set(seatId, user, {
            NX: true,
            EX: 20
        });

        if (result === 'OK') {
            console.log(`   ✅ SUCCESS: Locked for ${user}`);
            res.json({ success: true, message: "🎉 Booking Confirmed!" });
        } else {
            // Check who owns it
            const owner = await client.get(seatId);
            const ttl = await client.ttl(seatId);
            console.log(`   ❌ FAILED: Blocked by lock owned by ${owner}`);
            res.json({ 
                success: false, 
                message: `❌ Failed! Seat held by ${owner}`,
                ttl: ttl 
            });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Start Server
app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
});