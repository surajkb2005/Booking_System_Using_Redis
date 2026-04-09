// public/script.js
const API = `${window.location.origin}/api`;
const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${wsProtocol}://${window.location.host}`);

const ROUTE_PRICES = {
    "GO-ND": 6000,
    "BENG-ND": 8000,
    "GO-MUMb": 2000,
    "BENG-MUMb": 3000
};
const CITY_NAMES = {
    ND: "New Delhi",
    MUMb: "Mumbai",
    GO: "Goa",
    BENG: "Bengaluru"
};
let CURRENT_FLIGHT_KEY = "";

ws.onmessage = (event) => {
    console.log("WS MESSAGE:", event.data);

    const data = JSON.parse(event.data);

    if (data.type === "seat_update") {
        if (!data.seatId.startsWith(CURRENT_FLIGHT_KEY))
            return; // ignore other flights
    }

    const actualSeatId = data.seatId.split(':').pop();

    if (data.type === "seat_update") {

        const currentUser = document.getElementById('username').value;

        const seatDiv = document.querySelector(`#timer-${actualSeatId}`)?.closest('.seat');

        // Don't override booked seats
        if (seatDiv?.classList.contains('booked')) return;

        if (data.status === "confirmed") {
            updateSeatUI(actualSeatId, 'booked');

            const btn = document.getElementById(`btn-${actualSeatId}`);
            if (btn) btn.style.display = 'none';

        } else if (data.status === "held") {

            updateSeatUI(actualSeatId, 'held');

            const btn = document.getElementById(`btn-${actualSeatId}`);

            if (data.user === currentUser) {
                // My seat
                if (btn) btn.style.display = 'block';

                // start timer for me
                startCountdown(20, actualSeatId, data.user);

            } else {
                // Someone else
                if (btn) btn.style.display = 'none';
            }
        } else if (data.status === "available") {
            updateSeatUI(actualSeatId, 'available');

            const btn = document.getElementById(`btn-${actualSeatId}`);
            if (btn) btn.style.display = 'none';

            const timerEl = document.getElementById(`timer-${actualSeatId}`);
            if (timerEl) timerEl.innerHTML = '';
        }
    }
};

let timers = {};

// async function loadFlights() {
//     const res = await fetch(`${API}/flights`);
//     const flights = await res.json();
//     const tbody = document.getElementById('flight-table');

//     tbody.innerHTML = '';
//     flights.forEach(f => {
//         tbody.innerHTML += `<tr>
//             <td><strong>${f.id}</strong><br><small>${f.airline}</small></td>
//             <td>$${f.price}</td>
//             <td><button onclick="deleteFlight('${f.id}')" style="background:none; border:none; cursor:pointer;">❌</button></td>
//         </tr>`;
//     });
// }

function addFlight() {
    const origin = document.getElementById('forig').value;
    const dest = document.getElementById('fdest').value;
    const flightId = document.getElementById('fid').value;

    if (!origin || !dest) {
        alert("Please select both origin and destination");
        return;
    }

    const routeKey = `${origin}-${dest}`;

    const price = ROUTE_PRICES[routeKey];

    if (!price) {
        alert("Route not available");
        return;
    }

    const tbody = document.getElementById('flight-table');

    tbody.innerHTML = `
        <tr>
            <td><strong>${flightId}</strong><br><small>${origin} → ${dest}</small></td>
            <td>₹${price}</td>
            <td><button onclick="selectFlight('${flightId}','${origin}','${dest}')">Select</button></td>
        </tr>
    `;
}

function selectFlight(flightId, origin, dest) {
    CURRENT_FLIGHT_KEY = `${flightId}:${origin}-${dest}`;

    // clear old timers
    Object.values(timers).forEach(clearInterval);
    timers = {};

    generateSeats();
    initialLoadSeats();
}

// async function deleteFlight(id) {
//     await fetch(`${API}/flights/${id}`, {
//         method: 'DELETE'
//     });

//     loadFlights();
// }

async function initialLoadSeats() {
    const keys = await fetch(`${API}/bookings/seats?flightKey=${CURRENT_FLIGHT_KEY}`).then(r => r.json());

    Object.keys(keys).forEach(id => {
        const status = keys[id].status;
        updateSeatUI(id, status === 'confirmed' ? 'booked' : 'held');
    });
}

async function holdSeat() {
    const user = document.getElementById('username').value;
    const seatId = document.getElementById('seatId').value.toLowerCase();
    const box = document.getElementById('status-box');

    const res = await fetch(`${API}/bookings/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId, user })
    });

    const data = await res.json();

    if (data.success) {
        box.style.display = 'block';
        box.innerHTML = " Seat held!";
        startCountdown(20, seatId, user);
    } else {
        box.style.display = 'block';
        box.innerHTML = ` ${data.message} (${data.ttl}s left)`;
    }
}

function startCountdown(seconds, seatId, user) {
    // const box = document.getElementById('status-box');
    const timerEl = document.getElementById(`timer-${seatId}`);

    // box.style.display = 'block';

    // clear existing timer for this seat
    if (timers[seatId]) {
        clearInterval(timers[seatId]);
    }

    timers[seatId] = setInterval(() => {
        if (timerEl) {
            timerEl.innerHTML = ` ${seconds}s`;
        }
        // box.innerHTML = ` ${seatId.toUpperCase()} → Confirm in ${seconds}s 
        // <br><button onclick="confirmSeat('${seatId}','${user}')">Confirm</button>`;

        seconds--;

        if (seconds < 0) {
            const btn = document.getElementById(`btn-${seatId}`);
            if (btn) btn.style.display = 'none';

            clearInterval(timers[seatId]);
            delete timers[seatId];

            // reset UI when expired
            updateSeatUI(seatId, 'available');

            if (timerEl) timerEl.innerHTML = '';
        }
    }, 1000);
}

async function confirmSeat(seatId, user) {
    const box = document.getElementById('status-box');
    const timerEl = document.getElementById(`timer-${seatId}`);
    if (timerEl) timerEl.innerHTML = '';
    const fullSeatId = `${CURRENT_FLIGHT_KEY}:${seatId}`;

    const res = await fetch(`${API}/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId: fullSeatId, user })
    });

    const data = await res.json();

    box.style.display = 'block';

    if (data.success) {
        clearInterval(timers[seatId]);
        delete timers[seatId];

        updateSeatUI(seatId, 'booked');

        const timerEl = document.getElementById(`timer-${seatId}`);
        if (timerEl) timerEl.innerHTML = '';

        const btn = document.getElementById(`btn-${seatId}`);
        if (btn) btn.remove();

        box.innerHTML = `🎉 Seat ${seatId.toUpperCase()} booked successfully!`;
        box.className = 'success';
    } else {
        box.innerHTML = ` ${data.message}`;
        box.className = 'error';
    }
}

function generateSeats() {
    const map = document.getElementById('seat-map');
    map.innerHTML = '';

    const rows = ['A', 'B', 'C'];
    const cols = [1, 2, 3, 4];

    rows.forEach(r => {
        cols.forEach(c => {
            const seatId = (r + c).toLowerCase();

            const div = document.createElement('div');
            div.className = 'seat available';
            div.innerHTML = `
                <div class="seat-id">${r + c}</div>
                <div class="seat-timer" id="timer-${seatId}"></div>
                <button class="confirm-btn" id="btn-${seatId}" style="display:none" 
                    onclick="event.stopPropagation(); confirmSeat('${seatId}', document.getElementById('username').value)"
                >
                    Confirm
                </button>
            `;

            div.onclick = () => {
                if (!div.classList.contains('booked')) {
                    handleSeatClick(seatId);
                }
            };

            map.appendChild(div);
        });
    });
}

async function handleSeatClick(seatId) {
    const user = document.getElementById('username').value;

    if (!user) return alert("Enter your name");

    const seatDiv = document.querySelector(`#timer-${seatId}`)?.closest('.seat');

    if (seatDiv?.classList.contains('held')) {
        return; // ignore extra clicks
    }

    await holdSeatFromUI(seatId, user);
}

async function holdSeatFromUI(seatId, user) {
    const box = document.getElementById('status-box');
    const btn = document.getElementById(`btn-${seatId}`);
    const fullSeatId = `${CURRENT_FLIGHT_KEY}:${seatId}`;

    const res = await fetch(`${API}/bookings/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId: fullSeatId, user })
    });

    const data = await res.json();

    box.style.display = 'block'; // always show

    if (data.success) {
        if (btn) {
            btn.style.display = 'block';
            btn.onclick = () => confirmSeat(seatId, user);
        }
        box.innerHTML = ` Seat ${seatId.toUpperCase()} held for you`;
        box.className = 'success';

        updateSeatUI(seatId, 'held');
        startCountdown(20, seatId, user);

    } else {
        if (data.message.includes(user)) {
            // already held by same user -> keep button
            if (btn) btn.style.display = 'block';
        } else {
            if (btn) btn.style.display = 'none';
        }

        if (data.ttl > 0) {
            box.innerHTML = ` ${data.message} <br> Try again in ${data.ttl}s`;
        } else {
            box.innerHTML = ` Seat Booked!`;
        }
        box.className = 'error';
    }
}

function updateSeatUI(seatId, status) {
    const seats = document.querySelectorAll('.seat');

    seats.forEach(seat => {
        const id = seat.querySelector('.seat-id').innerText.toLowerCase();
        if (id === seatId) {
            seat.classList.remove('available', 'held', 'booked');
            seat.classList.add(status);
        }
    });
}

// Initial Load
// loadFlights();
// generateSeats();
initialLoadSeats();