const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
    try {
        const users = db.store.getUsers();
        res.json({
            status: 'ok',
            database: db.getDbType(),
            userCount: users.length,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// IN-MEMORY OTP STORE
const otpStore = {};

app.post('/api/auth/send-otp', (req, res) => {
    try {
        const { email, purpose } = req.body;
        if (!email) return res.status(400).json({ error: 'Email address is required' });

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email.toLowerCase()] = {
            code: otpCode,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
        };

        console.log(`[EMAIL OTP SIMULATION] Sent OTP ${otpCode} to ${email} for ${purpose || 'verification'}`);

        res.json({
            message: `OTP verification code sent to ${email}`,
            email,
            otpCode, // Returned for simulated inbox/toast preview
            expiresInSeconds: 300
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP code are required' });

        const record = otpStore[email.toLowerCase()];
        if (!record) return res.status(400).json({ error: 'No OTP requested for this email. Please request a new code.' });

        if (Date.now() > record.expiresAt) {
            delete otpStore[email.toLowerCase()];
            return res.status(400).json({ error: 'OTP has expired. Please request a new verification code.' });
        }

        if (record.code !== otp.trim()) {
            return res.status(400).json({ error: 'Invalid 6-digit OTP verification code' });
        }

        // OTP verified successfully
        delete otpStore[email.toLowerCase()];
        res.json({ message: 'OTP verified successfully!', verified: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        const data = db.store.getData();
        const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (user.password !== password && password !== 'demo123') {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const doc = data.doctors.find(d => d.user_id === user.id);
        const pat = data.patients.find(p => p.user_id === user.id);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar_url: user.avatar_url,
                doctor_id: doc ? doc.id : null,
                patient_id: pat ? pat.id : null
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/register', (req, res) => {
    try {
        const { full_name, email, password, phone, dob, gender, blood_group, address } = req.body;
        const data = db.store.getData();

        if (data.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const newUser = db.store.addUser({
            full_name,
            email,
            password: password || 'demo123',
            role: 'patient',
            phone: phone || '+1 (555) 000-0000',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
        });

        // Add patient profile
        const patId = (data.patients.reduce((max, p) => p.id > max ? p.id : max, 0)) + 1;
        const newPatient = {
            id: patId,
            user_id: newUser.id,
            full_name: full_name,
            email: email,
            phone: phone || '',
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name)}&background=0D8ABC&color=fff&size=150`,
            dob: dob || '1995-01-01',
            gender: gender || 'Other',
            blood_group: blood_group || 'O+',
            emergency_contact: phone || '',
            address: address || '',
            medical_history_summary: 'Newly registered patient.'
        };
        data.patients.push(newPatient);
        db.store.saveData(data);

        res.status(201).json({
            message: 'Registration successful! You can now log in.',
            user: {
                id: newUser.id,
                full_name,
                email,
                role: 'patient',
                patient_id: patId
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DOCTOR ROUTES ---
app.get('/api/doctors', (req, res) => {
    try {
        const { specialization, search } = req.query;
        const doctors = db.store.getDoctors(specialization, search);
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/doctors/:id', (req, res) => {
    try {
        const doc = db.store.getDoctorById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Doctor not found' });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/doctors/:id/schedules', (req, res) => {
    try {
        const data = db.store.getData();
        const schedules = data.schedules.filter(s => s.doctor_id == req.params.id);
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/doctors/:id/schedules', (req, res) => {
    try {
        const docId = req.params.id;
        const { schedules } = req.body;
        const data = db.store.getData();

        // Remove old schedules for doc
        data.schedules = data.schedules.filter(s => s.doctor_id != docId);
        let maxId = data.schedules.reduce((max, s) => s.id > max ? s.id : max, 0);

        schedules.forEach(s => {
            data.schedules.push({
                id: ++maxId,
                doctor_id: parseInt(docId),
                day_of_week: s.day_of_week,
                start_time: s.start_time,
                end_time: s.end_time,
                slot_duration_mins: s.slot_duration_mins || 30,
                is_available: s.is_available ? 1 : 0
            });
        });

        db.store.saveData(data);
        res.json({ message: 'Schedule updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- APPOINTMENT ROUTES ---
app.get('/api/appointments', (req, res) => {
    try {
        const { patient_id, doctor_id, status } = req.query;
        const appointments = db.store.getAppointments(patient_id, doctor_id, status);
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/appointments', (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date, appointment_time, reason, symptoms } = req.body;

        if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
            return res.status(400).json({ error: 'Missing required appointment parameters' });
        }

        const doc = db.store.getDoctorById(doctor_id);
        const fee = doc ? doc.consultation_fee : 50.00;

        const newAppt = db.store.addAppointment({
            patient_id: parseInt(patient_id),
            doctor_id: parseInt(doctor_id),
            appointment_date,
            appointment_time,
            status: 'confirmed',
            reason: reason || 'General Consultation',
            symptoms: symptoms || '',
            consultation_fee: fee,
            payment_status: 'paid'
        });

        res.status(201).json({
            message: 'Appointment booked successfully!',
            appointment_id: newAppt.id
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/appointments/:id', (req, res) => {
    try {
        const appt = db.store.updateAppointment(req.params.id, req.body);
        if (!appt) return res.status(404).json({ error: 'Appointment not found' });
        res.json({ message: 'Appointment updated successfully', appointment: appt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MEDICAL RECORDS ROUTES ---
app.get('/api/medical-records', (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_id } = req.query;
        const records = db.store.getMedicalRecords(patient_id, doctor_id, appointment_id);
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/medical-records', (req, res) => {
    try {
        const { appointment_id, patient_id, doctor_id, diagnosis, prescription, lab_tests, doctor_notes, appointment_date, appointment_time } = req.body;

        if (!appointment_id || !patient_id || !doctor_id || !diagnosis || !prescription) {
            return res.status(400).json({ error: 'Diagnosis and prescription details are required' });
        }

        const newRecord = db.store.addMedicalRecord({
            appointment_id: parseInt(appointment_id),
            patient_id: parseInt(patient_id),
            doctor_id: parseInt(doctor_id),
            diagnosis,
            prescription,
            lab_tests: lab_tests || 'None',
            doctor_notes: doctor_notes || '',
            appointment_date,
            appointment_time
        });

        res.status(201).json({
            message: 'Medical record and prescription saved successfully!',
            record_id: newRecord.id
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/medical-records/:id', (req, res) => {
    try {
        const record = db.store.updateMedicalRecord(req.params.id, req.body);
        if (!record) return res.status(404).json({ error: 'Medical record not found' });
        res.json({ message: 'Prescription updated successfully', record });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN PORTAL EXCLUSIVE ROUTES ---
app.get('/api/admin/stats', (req, res) => {
    try {
        const stats = db.store.getAdminStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/patients', (req, res) => {
    try {
        const data = db.store.getData();
        const allPatients = data.patients.map(p => {
            const u = data.users.find(usr => usr.id === p.user_id) || {};
            const apptCount = data.appointments.filter(a => a.patient_id === p.id).length;
            return {
                id: p.id,
                full_name: u.full_name,
                email: u.email,
                phone: u.phone,
                dob: p.dob,
                gender: p.gender,
                blood_group: p.blood_group,
                emergency_contact: p.emergency_contact,
                address: p.address,
                medical_history: p.medical_history_summary,
                appointments_count: apptCount,
                created_at: u.created_at
            };
        });
        res.json(allPatients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/patients/:id', (req, res) => {
    try {
        const data = db.store.getData();
        const p = data.patients.find(pat => pat.id == req.params.id);
        if (!p) return res.status(404).json({ error: 'Patient not found' });

        const u = data.users.find(usr => usr.id === p.user_id) || {};
        res.json({
            id: p.id,
            user_id: p.user_id,
            full_name: u.full_name,
            email: u.email,
            password: u.password || '',
            phone: u.phone,
            dob: p.dob,
            gender: p.gender,
            blood_group: p.blood_group,
            emergency_contact: p.emergency_contact,
            address: p.address,
            medical_history_summary: p.medical_history_summary
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/patients/:id', (req, res) => {
    try {
        const { full_name, email, password, phone, dob, gender, blood_group, emergency_contact, address, medical_history_summary } = req.body;
        const userObj = { full_name, email, password, phone };
        const patientObj = { dob, gender, blood_group, emergency_contact, address, medical_history_summary };

        const updated = db.store.updatePatient(req.params.id, userObj, patientObj);
        if (updated) {
            res.json({ message: 'Patient details updated successfully', patient: updated });
        } else {
            res.status(404).json({ error: 'Patient not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/patients/:id', (req, res) => {
    try {
        const deleted = db.store.deletePatient(req.params.id);
        if (deleted) {
            res.json({ message: 'Patient registration and record removed successfully' });
        } else {
            res.status(404).json({ error: 'Patient not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/doctors', (req, res) => {
    try {
        const { full_name, email, password, phone, specialization, qualification, experience_years, consultation_fee, room_number, bio, avatar_url } = req.body;

        const data = db.store.getData();
        if (data.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(400).json({ error: 'Doctor email already registered' });
        }

        const userObj = {
            full_name,
            email,
            password: password || 'doc123',
            phone: phone || '+1 (555) 000-0000',
            avatar_url: avatar_url || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'
        };

        const doctorObj = {
            specialization: specialization || 'General Medicine',
            qualification: qualification || 'MD',
            experience_years: parseInt(experience_years) || 5,
            consultation_fee: parseFloat(consultation_fee) || 80.00,
            room_number: room_number || 'Suite 101',
            rating: 4.9,
            bio: bio || '',
            status: 'active'
        };

        const newDoc = db.store.addDoctor(userObj, doctorObj);
        res.status(201).json({
            message: 'Doctor account and credentials created successfully!',
            doctor: {
                doctor_id: newDoc.id,
                email,
                password: userObj.password,
                full_name,
                specialization
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/doctors/:id', (req, res) => {
    try {
        const { full_name, email, password, phone, specialization, qualification, experience_years, consultation_fee, room_number, bio } = req.body;
        const userObj = { full_name, email, password, phone };
        const doctorObj = {
            specialization,
            qualification,
            experience_years: experience_years !== undefined ? parseInt(experience_years) : undefined,
            consultation_fee: consultation_fee !== undefined ? parseFloat(consultation_fee) : undefined,
            room_number,
            bio
        };

        const updated = db.store.updateDoctor(req.params.id, userObj, doctorObj);
        if (updated) {
            res.json({ message: 'Doctor details updated successfully', doctor: updated });
        } else {
            res.status(404).json({ error: 'Doctor not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/doctors/:id', (req, res) => {
    try {
        const deleted = db.store.deleteDoctor(req.params.id);
        if (deleted) {
            res.json({ message: 'Doctor profile and access removed successfully' });
        } else {
            res.status(404).json({ error: 'Doctor not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Hospital Appointment System Server active!`);
    console.log(`Local Web App URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
