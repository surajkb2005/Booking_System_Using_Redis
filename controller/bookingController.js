const client = require('../config/redisClient');


exports.holdSeat = async (req, res) => {
    const { seatId, user } = req.body;

    const value = {
        user,
        status: "hold"
    };

    const result = await client.set(seatId, value, {
        nx: true,
        ex: 20
    });

    if (result === 'OK') {
        res.json({ success: true, message: "Seat held for 20s" });
    } else {
        const data = await client.get(seatId);
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

    const parsed = data;

    if (parsed.user !== user) {
        return res.json({ success: false, message: "Not your seat!" });
    }

    // Remove TTL -> permanent booking
    await client.set(seatId, {
        user,
        status: "confirmed"
    });

    res.json({ success: true, message: "✅ Seat Confirmed!" });
};

exports.getSeats = async (req, res) => {
    const seats = [
        'a1', 'a2', 'a3', 'a4',
        'b1', 'b2', 'b3', 'b4',
        'c1', 'c2', 'c3', 'c4'
    ];

    const values = await client.mget(...seats); // 🔥 ONE call

    const result = {};

    seats.forEach((seat, i) => {
        if (values[i]) {
            result[seat] = values[i];
        }
    });

    res.json(result);
};
