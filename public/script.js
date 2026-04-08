// public/script.js
const API = 'http://localhost:3000/api';
const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${wsProtocol}://${window.location.host}`);

ws.onmessage = (event) => {
    console.log("WS MESSAGE:", event.data);

    const data = JSON.parse(event.data);

    if (data.type === "seat_update") {

        const currentUser = document.getElementById('username').value;

        const seatDiv = document.querySelector(`#timer-${data.seatId}`)?.closest('.seat');

        // Don't override booked seats
        if (seatDiv?.classList.contains('booked')) return;

        if (data.status === "confirmed") {
            updateSeatUI(data.seatId, 'booked');

            const btn = document.getElementById(`btn-${data.seatId}`);
            if (btn) btn.style.display = 'none';

        } else if (data.status === "held") {

            updateSeatUI(data.seatId, 'held');

            const btn = document.getElementById(`btn-${data.seatId}`);

            if (data.user === currentUser) {
                // My seat
                if (btn) btn.style.display = 'block';

                // start timer for me
                startCountdown(20, data.seatId, data.user);

            } else {
                // Someone else
                if (btn) btn.style.display = 'none';
            }
        } else if (data.status === "available") {
            updateSeatUI(data.seatId, 'available');

            const btn = document.getElementById(`btn-${data.seatId}`);
            if (btn) btn.style.display = 'none';

            const timerEl = document.getElementById(`timer-${data.seatId}`);
            if (timerEl) timerEl.innerHTML = '';
        }
    }
};

let timers = {};

async function loadFlights() {
    const res = await fetch(`${API}/flights`);
    const flights = await res.json();
    const tbody = document.getElementById('flight-table');

    tbody.innerHTML = '';
    flights.forEach(f => {
        tbody.innerHTML += `<tr>
            <td><strong>${f.id}</strong><br><small>${f.airline}</small></td>
            <td>$${f.price}</td>
            <td><button onclick="deleteFlight('${f.id}')" style="background:none; border:none; cursor:pointer;">❌</button></td>
        </tr>`;
    });
}

async function addFlight() {
    const id = document.getElementById('fid').value;
    const airline = document.getElementById('fairline').value;
    const destination = document.getElementById('fdest').value;
    const price = document.getElementById('fprice').value;

    if (!id) return alert("Enter Flight ID");

    // Matches your server.js req.body exactly
    await fetch(`${API}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, airline, destination, price })
    });

    loadFlights();
}

async function deleteFlight(id) {
    await fetch(`${API}/flights/${id}`, {
        method: 'DELETE'
    });

    loadFlights();
}

async function initialLoadSeats() {
    const keys = await fetch(`${API}/bookings/seats`).then(r => r.json());

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

    const res = await fetch(`${API}/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId, user })
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

// async function bookTicket() {
//     const user = document.getElementById('username').value;
//     const seatId = document.getElementById('seatId').value.toLowerCase();
//     const box = document.getElementById('status-box');

//     if (!user || !seatId) return alert("Enter details");

//     box.style.display = 'block';
//     box.innerHTML = ' Processing...';
//     box.className = '';

//     const res = await fetch(`${API}/book`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ seatId, user })
//     });
//     const data = await res.json();

//     if (data.success) {
//         box.innerHTML = ` ${data.message}`;
//         box.className = 'success';
//     } else {
//         // data.ttl is used here just like in your friend's original code
//         box.innerHTML = ` ${data.message} (Try in ${data.ttl}s)`;
//         box.className = 'error';
//     }
// }

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

    const res = await fetch(`${API}/bookings/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId, user })
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

// async function refreshSeats() {
//     const keys = await fetch(`${API}/bookings/seats`).then(r => r.json());

//     document.querySelectorAll('.seat').forEach(seat => {
//         const id = seat.querySelector('.seat-id').innerText.toLowerCase();

//         if (keys[id]) {
//             const status = keys[id].status;
//             const currentSeat = document.querySelector(`#timer-${id}`)?.closest('.seat');

//             if (currentSeat?.classList.contains('booked')) return;

//             updateSeatUI(id, status === 'confirmed' ? 'booked' : 'held');
//         } else {
//             //  Seat no longer exists in Redis → make it available
//             updateSeatUI(id, 'available');
//         }
//     });
// }

// Initial Load
loadFlights();
generateSeats();
initialLoadSeats();