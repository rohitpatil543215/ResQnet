# ResQNet — Intelligent Emergency Response Network

> 🚨 A citizen-powered real-time emergency response platform that reduces response time during road accidents and SOS situations through community coordination.

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-19-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **🔐 Multi-Role Auth** | JWT login for Citizen, Doctor, NSS Volunteer, Hospital, Admin, Traffic Police |
| **🚨 SOS System** | One-tap emergency with GPS, type selection, AI severity detection |
| **📡 Radius Escalation** | Auto-expands search from 0.5km → 2km → 5km → 10km |
| **🛡️ 10km Distance Limit** | Only helpers within 10km can respond (enforced server-side) |
| **🔔 Real-Time Alerts** | Socket.io notifications to nearby users |
| **📍 Live Tracking** | Real-time helper movement on map with ETA, distance, route |
| **🚔 Traffic Police Dashboard** | Live emergency map with all responder routes and ETAs |
| **🗺️ Emergency Heatmap** | Visualize incident hotspots with time-period filters |
| **🏆 Daily Hero Citizens** | Recognition wall for users who help in emergencies |
| **🧬 Blood Donor Match** | Priority alerts to matching blood group donors |
| **📊 Admin Dashboard** | Analytics, response time stats, severity charts |
| **📵 Offline Mode** | SMS fallback to 112 when no internet |
| **🧠 AI Enhancement** | Severity auto-classification based on emergency type |
| **🧑‍⚕️ First Aid Guide** | Dynamic step-by-step first aid based on emergency type |

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19 (Vite), Framer Motion, Google Maps API, Socket.io Client, Axios |
| **Backend** | Node.js, Express.js, MongoDB + Mongoose, Socket.io, JWT, bcryptjs |
| **Database** | MongoDB Atlas (free M0 cluster) |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 📦 Project Structure

```
ResQNet/
├── backend/
│   ├── config/           # DB connection, Socket.io setup
│   ├── controllers/      # Route handlers (auth, emergency, user, heatmap, traffic)
│   ├── middlewares/       # Auth (JWT), rate limiting, role-based authorization
│   ├── models/            # MongoDB schemas (User, Emergency, Hospital, HelperLocation, AnalyticsLog)
│   ├── routes/            # API route definitions
│   ├── services/          # AI severity, SMS, notification services
│   ├── utils/             # Haversine distance calculator
│   ├── server.js          # Express entry point
│   ├── seed.js            # Demo data seeder (runs on first boot)
│   └── .env.example       # Backend environment template
├── src/
│   ├── api/               # Axios client + Socket.io connection
│   ├── components/        # Reusable UI (Navbar, MapView, LiveTrackingMap, etc.)
│   ├── context/           # AuthContext, ThemeContext
│   ├── pages/             # All page components
│   │   ├── Dashboard.jsx
│   │   ├── ActiveEmergencyPage.jsx    # Live helper tracking with route details
│   │   ├── NearbyEmergencies.jsx
│   │   ├── HeroCitizenPage.jsx        # Daily hero recognition
│   │   ├── LeaderboardPage.jsx
│   │   ├── HeatmapPage.jsx            # Emergency heatmap (admin)
│   │   ├── TrafficDashboard.jsx        # Traffic police command center
│   │   ├── AdminDashboard.jsx
│   │   └── ...
│   └── index.css          # Complete design system
├── .env.example           # Frontend environment template
├── .gitignore
├── vercel.json            # Vercel SPA routing config
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js 18+** — [download](https://nodejs.org)
- **MongoDB Atlas** (free) — [create cluster](https://www.mongodb.com/atlas) *(optional — app runs with in-memory DB if no Atlas URI)*
- **Google Maps API Key** (optional) — maps show a fallback UI without it

### Step 1: Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/resqnet.git
cd resqnet

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### Step 2: Configure Environment

```bash
# Create frontend env
cp .env.example .env

# Create backend env
cp backend/.env.example backend/.env
```

Edit the files with your values (see sections below for details).

### Step 3: Start Development

```bash
# Terminal 1 — Start backend (port 5000)
cd backend && node server.js

# Terminal 2 — Start frontend (port 3000)
npm run dev
```

### Step 4: Open App

Visit **http://localhost:3000**

> **Note:** If no MongoDB URI is configured, the app automatically uses an in-memory database and seeds itself with demo data on every restart. Data is lost when the server stops.

---

## 🔑 Login Credentials (Demo Data)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@resqnet.com` | `admin123` |
| **Traffic Police** | `traffic@resqnet.com` | `traffic123` |
| **Citizen** | `aarav.sharma@resqnet.com` | `password123` |
| **Doctor** | `sneha.desai@resqnet.com` | `password123` |
| **NSS Volunteer** | `priya.patel@resqnet.com` | `password123` |

> All 50+ demo users use password: `password123`

---

## 🗺️ Google Maps API Integration

The app works **without** Google Maps — it shows a built-in fallback UI. To enable real maps:

### Step 1: Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services → Library**
4. Enable these APIs:
   - **Maps JavaScript API** (required)
   - **Directions API** (for route polylines)
   - **Visualization Library** (for heatmap — included with Maps JS API)
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. Copy your API key

### Step 2: Restrict API Key (Important for security)

1. Click your API key → **Edit**
2. Under **Application restrictions**: select **HTTP referrers**
3. Add your domains:
   ```
   http://localhost:3000/*
   http://localhost:5173/*
   https://your-app.vercel.app/*
   ```
4. Under **API restrictions**: select **Restrict key** → select the 3 APIs above

### Step 3: Add to Environment

In your **frontend `.env`** file:
```env
VITE_GOOGLE_MAPS_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX
```

> **Cost:** Google gives $200/month free credit (~28,000 map loads). More than enough for a prototype.

---

## 🗄️ MongoDB Atlas Setup (Persistent Data)

Without Atlas, data resets on every server restart. To make data permanent:

### Step 1: Create Free Cluster

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click **Try Free** → Sign up
3. Choose **M0 Free Tier** (512 MB, plenty for prototype)
4. Select region closest to you
5. Click **Create Cluster** (takes 2-3 minutes)

### Step 2: Create Database User

1. Go to **Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Set username and password (remember these!)
4. Give **Read and write to any database** privileges

### Step 3: Allow Network Access

1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (for development)
3. For production, add your server's IP only

### Step 4: Get Connection String

1. Go to **Database** → **Connect** → **Drivers**
2. Copy the connection string
3. Replace `<password>` with your DB user's password

### Step 5: Update Backend .env

```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/resqnet?retryWrites=true&w=majority
```

---

## 🚢 Deployment

### Frontend → Vercel (Free)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → Select your repo
3. Set **Framework Preset**: Vite
4. Add environment variables:
   ```
   VITE_API_URL = https://your-backend.onrender.com/api
   VITE_SOCKET_URL = https://your-backend.onrender.com
   VITE_GOOGLE_MAPS_KEY = (your key, optional)
   ```
5. Deploy! ✅

### Backend → Render (Free)

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add environment variables:
   ```
   MONGODB_URI = (your Atlas URI)
   JWT_SECRET = (any random string)
   CLIENT_URL = https://your-app.vercel.app
   NODE_ENV = production
   ```
5. Deploy! ✅

> ⚠️ Render free tier spins down after 15 min of inactivity. First request after idle takes ~30 seconds.

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/users/profile` | ✅ | Get profile |
| PUT | `/api/users/profile` | ✅ | Update profile |
| PUT | `/api/users/availability` | ✅ | Toggle availability |
| GET | `/api/users/leaderboard` | ❌ | Get leaderboard |
| GET | `/api/users/heroes` | ❌ | Get daily hero citizens |
| POST | `/api/emergencies` | ✅ | Create SOS |
| GET | `/api/emergencies` | ✅ | List emergencies (with geo-filter) |
| PUT | `/api/emergencies/:id/help` | ✅ | Accept emergency (10km limit enforced) |
| PUT | `/api/emergencies/:id/resolve` | ✅ | Resolve emergency |
| GET | `/api/hospitals` | ✅ | Nearby hospitals |
| GET | `/api/analytics/dashboard` | 🔐 Admin | Analytics data |
| POST | `/api/helper-locations` | ✅ | Send live GPS ping |
| GET | `/api/helper-locations/:emgId` | ✅ | Get helper locations |
| GET | `/api/heatmap` | 🔐 Admin/Traffic | Heatmap coordinates |
| GET | `/api/traffic/active` | 🔐 Traffic/Admin | Active emergencies for traffic |

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `emergency:new` | Server → Client | New emergency broadcast |
| `emergency:updated` | Server → Client | Emergency status change |
| `emergency:resolved` | Server → Client | Emergency resolved |
| `helperLocationUpdate` | Client ↔ Server | Live helper GPS movement |
| `emergencyBroadcast` | Server → Traffic | New emergency alert for traffic |
| `emergencyClosed` | Server → All | Emergency closed notification |
| `join:traffic` | Client → Server | Join traffic dashboard room |

---

## 🔒 Security Features

- **bcrypt** password hashing (12 rounds)
- **JWT** token authentication with expiry
- **Rate limiting** (100 requests/15min, 5 SOS/min)
- **Role-based access** control (citizen, doctor, nss_volunteer, hospital, admin, traffic)
- **10km distance validation** — prevents remote users from accepting emergencies
- **Input validation** on all endpoints
- **CORS** configured per environment
- **Environment variables** for all secrets

---

## 🎨 Design System

- **Theme**: Emergency Red (#ef4444) + Dark (#0a0a0f)
- **Font**: Inter (Google Fonts)
- **Style**: Glassmorphism cards, smooth Framer Motion animations
- **Responsive**: Mobile-first, works on all screen sizes
- **Dark/Light Mode**: Toggle in navbar settings

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Citizen** | Dashboard, SOS, Nearby, Heroes, Leaderboard, Profile |
| **Doctor** | Same as Citizen + priority in emergency assignments |
| **NSS Volunteer** | Same as Citizen |
| **Traffic Police** | Same as Citizen + Traffic Dashboard + Heatmap |
| **Admin** | Everything + Admin Dashboard + Heatmap + Traffic Dashboard |

---

## 📄 License

MIT © ResQNet Team

---

> Built with ❤️ — Every second saves a life.
