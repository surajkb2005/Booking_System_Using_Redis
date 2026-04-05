const API = 'http://localhost:3000/api';

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
    await fetch(`${API}/flights/${id}`, { method: 'DELETE' });
    loadFlights();
}

async function bookTicket() {
    const user = document.getElementById('username').value;
    const seatId = document.getElementById('seatId').value;
    const box = document.getElementById('status-box');

    if (!user || !seatId) return alert("Enter details");

    box.style.display = 'block';
    box.innerHTML = '⚡ Processing...';
    box.className = '';

    const res = await fetch(`${API}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId, user })
    });
    const data = await res.json();

    if (data.success) {
        box.innerHTML = `✅ ${data.message}`;
        box.className = 'success';
    } else {
        // data.ttl is used here just like in your friend's original code
        box.innerHTML = `❌ ${data.message} (Try in ${data.ttl}s)`;
        box.className = 'error';
    }
}

// Initial Load
loadFlights();