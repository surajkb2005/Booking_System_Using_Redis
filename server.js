const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serves the HTML file

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

// Start Server
app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running at ${process.env.PORT || 3000}`);
});