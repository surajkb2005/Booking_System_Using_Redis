const API = 'http://localhost:3000/api';

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-wrapper');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.innerHTML = `<strong>${type === 'error' ? '⚡ Warning' : '✨ Success'}</strong><br>${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

function selectSeat(seat, element) {
    document.getElementById('seatId').value = seat;
    document.querySelectorAll('.seat-box').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

async function loadFlights() {
    const res = await fetch(`${API}/flights`);
    const flights = await res.json();
    const tbody = document.getElementById('flight-table');
    tbody.innerHTML = flights.map(f => `
        <tr>
            <td><strong>${f.id}</strong><br><small>${f.destination}</small></td>
            <td>$${f.price}</td>
            <td><button onclick="deleteFlight('${f.id}')" style="cursor:pointer; border:none; background:none;">🗑️</button></td>
        </tr>
    `).join('');
}

async function addFlight() {
    const id = document.getElementById('fid').value;
    const airline = document.getElementById('fairline').value;
    const destination = document.getElementById('fdest').value;
    const price = document.getElementById('fprice').value;

    if (!id) return showToast("Flight ID is mandatory", "error");

    await fetch(`${API}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, airline, destination, price })
    });

    showToast(`Flight ${id} added to Redis network`);
    loadFlights();
}

async function bookTicket() {
    const user = document.getElementById('username').value;
    const seatId = document.getElementById('seatId').value;
    const btn = document.getElementById('bookBtn');

    if (!user || !seatId) return showToast("Details incomplete", "error");

    btn.innerText = "Processing...";
    btn.style.opacity = "0.7";

    const res = await fetch(`${API}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId, user })
    });
    const data = await res.json();

    if (data.success) {
        showToast(`Confirmed! ${data.message}`);
        localStorage.setItem('lastUser', user);
    } else {
        showToast(`${data.message}`, "error");
    }

    btn.innerText = "Finalize Booking";
    btn.style.opacity = "1";
}

async function deleteFlight(id) {
    await fetch(`${API}/flights/${id}`, { method: 'DELETE' });
    loadFlights();
}

window.onload = () => {
    const saved = localStorage.getItem('lastUser');
    if (saved) document.getElementById('username').value = saved;
    loadFlights();
};