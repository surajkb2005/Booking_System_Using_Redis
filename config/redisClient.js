const redis = require('redis');

// We force 127.0.0.1 to avoid Windows connection issues
const client = redis.createClient({
    socket: { host: '127.0.0.1', port: 6379 }
});

client.on('error', (err) => console.log('❌ Redis Error:', err));

(async () => {
    try {
        await client.connect();
        console.log("✅ CONNECTED to Redis");
    } catch (e) {
        console.log("❌ Redis Connection Failed");
    }
})();

module.exports = client;