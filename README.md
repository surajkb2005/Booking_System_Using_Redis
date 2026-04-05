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
