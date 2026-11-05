# 🚑 Robot Ambulance Bihar — 24/7 Patna Emergency Service

A state-of-the-art, 24/7 smart and robot-assisted emergency ambulance platform built for the **State of Bihar**, specially focused on the capital city **Patna** and covering all **38 Bihar districts**.

Inspired by and modeled after the high-performance dispatch architecture of **SaveLife Health Services** (`savelife.health`), enhanced with **Robotic Automated CPR**, **5G Tele-ICU Triage**, and **AI Smart City Corridor Navigation**.

---

## 🌟 Key Highlights & Capabilities

### 🤖 1. Robot & AI-Assisted Life Support
* **Robotic Mechanical CPR (Lucas 3 Technology)**: Continuous mechanical compressions (102 compressions/min) without fatigue or pauses on bumpy Bihar roads, maintaining cerebral and cardiac blood flow to AIIMS Patna.
* **Live 5G/4G Tele-ICU Streaming**: Real-time transmission of 12-lead ECG, blood pressure, oxygen saturation, and capnography directly to receiving emergency room doctors at PMCH, IGIMS, or Paras HMRI while en route.
* **AI Green-Corridor Navigation**: Real-time route optimization taking advantage of the Ganga Marine Drive (JP Ganga Path), AIIMS-Digha Elevated Highway, and Bailey Road to bypass congestion.
* **Digital Oxygen Telemetry**: Continuous sensor-monitored medical oxygen flow and automated low-tank alarms.

---

### 📍 2. Dedicated Patna & Bihar Focus
* **10–12 Minute Average Response Time**: Ambulances stationed across 6 rapid dispatch hubs in Patna:
  1. *Bailey Road - Raja Bazar Station*
  2. *Kankarbagh Doctors Colony Standby*
  3. *AIIMS Phulwari Sharif Trauma Unit*
  4. *Ashok Rajpath - PMCH Emergency Post*
  5. *Saguna More - Danapur Quick Hub*
  6. *Gandhi Maidan Central Corridor*
* **Patna Hospital Network Directory**: Direct triage linkages and emergency bedside handover with:
  * **AIIMS Patna** (Level-1 Apex Trauma & Heli-pad)
  * **PMCH** (Largest Tertiary Emergency Care)
  * **IGIMS Sheikhpura** (Super-Specialty & Oncology)
  * **Paras HMRI Raja Bazar** (NABH Cardiac & Stroke Center)
  * **Ruban Memorial Patliputra** (Interventional Critical Care)
  * **Mediversal Kankarbagh** (Trauma & Stroke Unit)
  * **Kurji Holy Family Hospital Digha** (Maternity & Emergency)
  * **Mahavir Cancer Sansthan Phulwari Sharif** (Oncology Emergency)
* **All 38 Bihar Districts Intercity Shifting**: Transparent fixed tariffs for transfers to Gaya, Muzaffarpur, Darbhanga, Bhagalpur, Begusarai, Purnia, Saharsa, Chapra, and Motihari.
* **Aero-Medical Transfers (Air Ambulance)**: Fixed-wing air ambulance transfers coordinated from Patna Airport (Jai Prakash Narayan International) to AIIMS Delhi, Medanta Gurgaon, Kolkata, and Mumbai.

---

### 💰 3. Upfront, Transparent Pricing (SaveLife Model)
* **Zero Surge Guarantee**: Fixed base price + transparent per-kilometer rate.
* **No Emergency Exploitation**: No haggling outside hospital gates; digital receipts, GST invoice, and instant fare calculator before booking.

---

## 🚑 Specialized Fleet Matrix

| Ambulance Type | Vehicle Model | Equipments & Robotic Gear | Base Price (5 km) | Extra / km |
| :--- | :--- | :--- | :---: | :---: |
| **BLS — Smart Eeco** | Maruti Suzuki Eeco | Oxygen cylinder, Stretcher, First Aid, BP, Pulse Oximeter, GPS | **₹1,499** | ₹35 |
| **BLS — Force Traveller** | Force Traveller T1 | High-pressure O2, hydraulic bed, attendant seating, AC | **₹2,199** | ₹45 |
| **ALS — Robotic ICU** | Force Traveller 3350 | **Draeger Ventilator, Robot Mechanical CPR, Cardiac Monitor, Defibrillator** | **₹3,999** | ₹75 |
| **ACLS — Cardiac Unit** | Mercedes / Force ICU | **12-Lead Tele-ECG, Cardiac Pacemaker, Thrombolytic Drug Box, Doctor on board** | **₹4,999** | ₹85 |
| **NICU / PICU Baby** | Pediatric Cruiser | **Dräger Transport Incubator, Baby Radiant Warmer, Infant Micro-Ventilator** | **₹4,499** | ₹90 |
| **Mortuary Van** | Force / Bolero Van | **Stainless Steel Mortuary Freezer Box (-5°C to 4°C), Inverter Backup** | **₹2,499** | ₹40 |
| **Air Ambulance** | Super King Air B200 | **Flying ICU, Aero-Medical Doctor & Nurse, Tarmac Bedside Transfer** | **₹4,25,000** | ₹350 |

---

## ⚡ Quickstart Guide

### 1. Prerequisites
* **Node.js** v18+ installed

### 2. Launch Local Server
```bash
# Navigate to the folder
cd d:\AI\robot-ambulance

# Start the emergency platform
npm start
```

### 3. Open in Browser
* **URL**: [http://localhost:3000](http://localhost:3000)
* **24/7 Helpline**: `+91 612 299 1088` / `+91 91220 10808`
* **WhatsApp Booking**: `+91 91220 10808`

---

## 🧪 Automated Testing
Run the 9-step integration test suite verifying health, hospital directory, fleet, fare calculation, booking, and radar tracking:
```bash
npm test
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Sample Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health & Patna helpline info | `{ status: "online", city: "Patna", helpline: "..." }` |
| `GET` | `/api/hospitals` | 8 premier Patna hospitals directory | Array of hospitals with emergency phones & beds |
| `GET` | `/api/fleet` | 7 ambulance types with robot specs | Array of vehicles with rates and robotic features |
| `GET` | `/api/districts` | Bihar 38 districts intercity rate card | Array of districts, distances, and flat transfer fares |
| `POST` | `/api/calculate-fare` | Upfront distance, ETA & fare computation | `{ routeEstimate: {...}, fareBreakdown: {...} }` |
| `POST` | `/api/book-ambulance` | Emergency ambulance dispatch | `{ booking: { id, assignedDriver, otp, etaMinutes } }` |
| `GET` | `/api/bookings/:id` | Live tracking status & radar data | Returns live driver position and ETA |
| `POST` | `/api/emergency-sos` | 1-Tap high priority emergency dispatch | Returns SOS dispatch code & immediate call back |
| `GET` | `/api/stats` | Active fleet, avg ETA, lives saved | `{ activeAmbulancesInPatna: 48, avgResponseTimeMins: 11.2 }` |

---

## 📂 Project Structure

```text
robot-ambulance/
├── server.js               # Express API and emergency dispatch core
├── package.json            # Dependencies and npm scripts
├── test.js                 # 9-step automated integration test suite
├── README.md               # Complete platform documentation
│
├── data/
│   ├── patna_hospitals.json # AIIMS, PMCH, IGIMS, Paras, Ruban, Mediversal, etc.
│   ├── fleet.json           # BLS, ALS Robotic, ACLS, NICU, Mortuary, Air Ambulance
│   ├── bihar_districts.json # Intercity transfer tariffs for all Bihar districts
│   └── bookings.json        # Persistent emergency dispatch ledger
│
└── public/                 # Responsive Web & Mobile PWA Client
    ├── index.html          # High-converting booking engine, radar, directories
    ├── manifest.webmanifest# PWA manifest for Android & iOS installation
    ├── css/
    │   └── style.css       # Medical emergency styling, responsive grids & radar
    ├── js/
    │   └── app.js          # Interactive fare calculator, GPS, booking & radar logic
    └── icons/              # App icons
        ├── icon-192.svg
        └── icon-512.svg
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
