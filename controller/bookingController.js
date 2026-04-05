const client = require('../config/redisClient');


exports.holdSeat = async (req, res) => {
    const { seatId, user } = req.body;

    const value = JSON.stringify({
        user,
        status: "hold"
    });

    const result = await client.set(seatId, value, {
        NX: true,
        EX: 20
    });

    if (result === 'OK') {
        res.json({ success: true, message: "Seat held for 20s" });
    } else {
        const data = JSON.parse(await client.get(seatId));
        const ttl = await client.ttl(seatId);

        res.json({
            success: false,
            message: `Held by ${data.user}`,
            ttl
        });
    }
};

exports.confirmSeat = async (req, res) => {
    const { seatId, user } = req.body;

    const data = await client.get(seatId);

    if (!data) {
        return res.json({ success: false, message: "Seat expired!" });
    }

    const parsed = JSON.parse(data);

    if (parsed.user !== user) {
        return res.json({ success: false, message: "Not your seat!" });
    }

    // Remove TTL -> permanent booking
    await client.set(seatId, JSON.stringify({
        user,
        status: "confirmed"
    }));

    res.json({ success: true, message: "✅ Seat Confirmed!" });
};

exports.getSeats = async (req, res) => {
    const keys = await client.keys('[abc][1-4]');
    const result = {};

    for (const key of keys) {
        const data = await client.get(key);
        if (data) {
            result[key] = JSON.parse(data);
        }
    }

    res.json(result);
};
