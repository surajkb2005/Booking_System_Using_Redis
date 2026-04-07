const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Store clients
let clients = [];

wss.on('connection', (ws) => {
    console.log(" WebSocket Connected");
    clients.push(ws);

    ws.on('close', () => {
        clients = clients.filter(c => c !== ws);
    });
});

// Broadcast function
global.broadcast = (data) => {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};


// Import Routes
const flightRoute = require('./routes/flightRoute');
const bookingRoute = require('./routes/bookingRoute');
const cleanRedisCache = require('./routes/cleanRedisCache.js');

//   API: FLIGHT MANAGEMENT (CRUD)
app.use('/api/flights', flightRoute);

//   API: BOOKING SYSTEM (RACE CONDITION)
app.use('/api/bookings', bookingRoute);

//   API: CLEAN REDIS CACHE
app.use('/api/clean', cleanRedisCache);

// Start server
server.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running`);
});