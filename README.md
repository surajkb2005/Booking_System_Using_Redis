# ✈️ RedisFly | Real-Time Booking System

**RedisFly** is a high-performance booking system demonstration designed to showcase **atomic operations** and **race condition prevention** in commercial online platforms. Built with the MERN stack and powered by Redis, it ensures that seat reservations are concurrency-safe and handled with sub-millisecond latency.

## 🚀 Key Features

### 🛡️ Atomic Concurrency Control
* **Race Condition Prevention**: Utilizes Redis `SET` with `NX` (Not Exists) and `EX` (Expire) arguments to create atomic locks for seat reservations.
* **Smart Throttling**: Implements a 20-second cool-down period for seat holds to demonstrate real-world lock expiration and prevent deadlocks.

### 🎨 Premium Frontend Experience
* **Glassmorphism UI**: A high-end, modern dashboard featuring backdrop-blur effects, vibrant gradients, and responsive layouts.
* **Persistent Sessions**: Uses `localStorage` to maintain passenger state across browser refreshes for a seamless user experience.
* **Interactive UX**: Real-time visual seat selection and non-blocking **Toast notifications** for instant feedback on Redis transactions.

### ⚙️ Full-Stack Architecture
* **Admin Fleet Manager**: A dedicated panel to deploy, monitor, and remove flight routes directly from the Redis database.
* **Modular Codebase**: Refactored for scalability with a clean separation between structural HTML, modern CSS design tokens, and asynchronous JavaScript logic.

## 🛠️ Tech Stack
* **Frontend**: Vanilla JS, CSS3 (Glassmorphism), HTML5
* **Backend**: Node.js, Express.js
* **Database**: Redis (High-speed key-value storage)

## 📦 Getting Started

### Prerequisites
* **Node.js** (v16+)
* **Redis Server** (Running on `127.0.0.1:6379`)

### Installation
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/surajkb2005/Booking_System_Using_Redis.git](https://github.com/surajkb2005/Booking_System_Using_Redis.git)
   cd Booking_System_Using_Redis

# Redis CLI Cheat Sheet (Flight Seat Booking)

## 🧠 View All Data

```bash
KEYS *
```

**Output:**

```
a1, a2, b1, c3, flight:101 ...
```

## 🟡 Check Specific Seat

```bash
GET c1
```

**Output:**

```json
{"user":"suraj","status":"hold"}
```

or

```json
{"user":"suraj","status":"confirmed"}
```

## ⏳ Check TTL

```bash
TTL c1
```

**Output:**

```
15   # expires in 15 sec
-1   # permanent (booked)
-2   # key doesn't exist
```

## 🔍 Get Multiple Seats

```bash
MGET a1 a2 a3 b1 b2 b3 c1 c2 c3
```

## ✈️ Flight Data (Hash)

```bash
HGETALL flight:101
```

**Output:**

```
airline      Indigo
destination  Delhi
price        5000
```

## 📦 All Flights

```bash
KEYS flight:*
```

## 🧹 Delete Seat

```bash
DEL c1
```

## 🔥 Reset Database

```bash
FLUSHDB
```

## 👀 Live Activity

```bash
MONITOR
```

**Output:**

```
SET c1 ...
GET c1 ...
TTL c1 ...
```

## 🧪 Manual Simulation

**Hold seat:**

```bash
SET c1 '{"user":"test","status":"hold"}' NX EX 20
```

**Confirm seat:**

```bash
SET c1 '{"user":"test","status":"confirmed"}'
```

## ⚡ Check Key Exists

```bash
EXISTS c1
```

**Output:**

```
1  # exists
0  # not exists
```

## 📊 Count Keys

```bash
DBSIZE
```

---

## 🧠 Quick Notes

| Command   | Use                               |
| --------- | --------------------------------- |
| GET       | Seat data (string JSON)           |
| HGETALL   | Flight data (hash)                |
| TTL       | Expiry logic                      |
| SET NX EX | Locking (prevent race conditions) |

---

## 🚀 Debug Flow

```bash
KEYS *
GET c1
TTL c1
```

👉 Helps identify:

* seat owner
* expiry status
* frontend/backend issue
