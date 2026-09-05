# 🩺 HealthCare Pulse - Hospital Appointment & EMR System

A comprehensive, full-stack Hospital Appointment Booking & Electronic Medical Record (EMR) Management Web Application built with Node.js, Express, SQLite3, HTML5, CSS3, and JavaScript.

---

## 🌟 Key Features

### 👤 Patient Portal
- **New Registration & Sign In** with simulated Email OTP verification.
- **Doctor Directory & Booking**: Browse doctors by specialization, view consultation fees, bio, and room numbers.
- **Interactive Working Hours & Slot Picker**: Select available date, time slots, reason for visit, and symptoms.
- **Dynamic UPI Payment & Real QR Code Generator**: Real-time QR code creation for payment verification in ₹ (Rupees).
- **Personal Prescription & Medical History**: View prescription details, dosage, diagnostic tests, doctor advice, and edit dates/times.

### 🩺 Doctor Portal
- **Doctor Sign In** with email & credentials.
- **Live Patient Roster & Appointment Queue**: View patient details, symptoms, visit dates, and appointment status.
- **Editable Prescriptions**: Add, edit, or update patient prescription details with date & timestamp tracking.
- **Availability Schedule Control**: Manage daily working hours and active slots.

### 🛡️ Hospital Administrator Control Panel
- **Hospital Overview & Analytics**: Live stats counter for active doctors, registered patients, total bookings, and revenue tracking.
- **Doctor Roster Control**: Appoint new doctors, update doctor details (specialization, room, fee), or revoke access.
- **Patient Directory & Records**: View full registered patient details, contact numbers, blood groups, and complete medical histories.

---

## 🛠️ Technology Stack
- **Backend**: Node.js, Express.js, SQLite3 (embedded relational database)
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (Custom Design System with dark/light theme support)
- **Utilities**: Chart.js (analytics visualization), QRCode.js (dynamic UPI QR rendering)

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v14 or higher)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Abishek7806/Hospital-Appointment-System.git
   cd Hospital-Appointment-System
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open in browser:
   ```
   http://localhost:3000
   ```

---

## 📂 Project Structure
```
Hospital-Appointment-System/
├── public/
│   ├── index.html       # Main Frontend Single Page Web App
│   ├── js/
│   │   └── app.js       # Client Logic & Interactive UI Controllers
│   └── css/
│       └── styles.css   # Custom CSS Design System
├── server.js            # Express API Server & REST Endpoints
├── db.js                # SQLite Database Interface & Schema Initializer
├── database.json        # SQLite Database Persistent Storage
├── schema.sql           # Database Table Schemas
├── seed.sql             # Demo Initial Data (Doctors, Patients, Appointments)
├── package.json         # Node.js Dependencies & NPM Scripts
└── README.md            # Documentation
```
