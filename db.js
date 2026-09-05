const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'database.json');
let isMysqlActive = false;
let mysqlPool = null;

// Initial JSON Database Structure
const initialData = {
    users: [
        { id: 1, full_name: 'Abishek (Admin)', email: 'abikrish@gmail.com', password: 'Abishek@2006', role: 'admin', phone: '+1 (555) 019-2831', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', created_at: '2026-08-24T10:00:00Z' },
        { id: 2, full_name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@hospital.com', password: 'demo123', role: 'doctor', phone: '+1 (555) 234-5678', avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150', created_at: '2026-08-24T10:00:00Z' },
        { id: 3, full_name: 'Dr. Marcus Vance', email: 'marcus.vance@hospital.com', password: 'demo123', role: 'doctor', phone: '+1 (555) 345-6789', avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', created_at: '2026-08-24T10:00:00Z' },
        { id: 4, full_name: 'Dr. Elena Rostova', email: 'elena.rostova@hospital.com', password: 'demo123', role: 'doctor', phone: '+1 (555) 456-7890', avatar_url: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?w=150', created_at: '2026-08-24T10:00:00Z' },
        { id: 5, full_name: 'Dr. David Kim', email: 'david.kim@hospital.com', password: 'demo123', role: 'doctor', phone: '+1 (555) 567-8901', avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150', created_at: '2026-08-24T10:00:00Z' },
        { id: 6, full_name: 'John Doe', email: 'john.doe@gmail.com', password: 'demo123', role: 'patient', phone: '+1 (555) 987-6543', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', created_at: '2026-08-24T10:00:00Z' },
        { id: 7, full_name: 'Emily Watson', email: 'emily.watson@gmail.com', password: 'demo123', role: 'patient', phone: '+1 (555) 876-5432', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', created_at: '2026-08-24T10:00:00Z' }
    ],
    doctors: [
        { id: 1, user_id: 2, specialization: 'Cardiology', qualification: 'MD, FACC - Harvard Medical', experience_years: 14, consultation_fee: 120.00, room_number: 'Suite 302', rating: 4.9, bio: 'Board-certified cardiologist specializing in preventive heart health, coronary artery disease, and hypertension management.', status: 'active' },
        { id: 2, user_id: 3, specialization: 'Neurology', qualification: 'MD, PhD - Johns Hopkins', experience_years: 11, consultation_fee: 140.00, room_number: 'Suite 405', rating: 4.8, bio: 'Expert in migraine disorders, neuro-inflammatory conditions, epilepsy, and cognitive neurological health.', status: 'active' },
        { id: 3, user_id: 4, specialization: 'Dermatology', qualification: 'MD - Stanford Health', experience_years: 8, consultation_fee: 95.00, room_number: 'Suite 108', rating: 4.9, bio: 'Specializes in cosmetic and surgical dermatology, eczema, acne therapies, and skin cancer screening.', status: 'active' },
        { id: 4, user_id: 5, specialization: 'Pediatrics', qualification: 'MD - Columbia University', experience_years: 9, consultation_fee: 85.00, room_number: 'Suite 201', rating: 4.7, bio: 'Compassionate pediatrician focused on child development, vaccinations, pediatric nutrition, and general care.', status: 'active' }
    ],
    patients: [
        { id: 1, user_id: 6, dob: '1988-04-12', gender: 'Male', blood_group: 'O+', emergency_contact: '+1 (555) 911-0022', address: '742 Evergreen Terrace, Springfield', medical_history_summary: 'Mild seasonal asthma, hypertension controlled with diet.' },
        { id: 2, user_id: 7, dob: '1994-09-25', gender: 'Female', blood_group: 'A+', emergency_contact: '+1 (555) 911-0033', address: '104 Lincoln Blvd, Chicago, IL', medical_history_summary: 'No major prior surgeries. Known penicillin allergy.' }
    ],
    schedules: [
        { id: 1, doctor_id: 1, day_of_week: 'Monday', start_time: '09:00 AM', end_time: '05:00 PM', slot_duration_mins: 30, is_available: 1 },
        { id: 2, doctor_id: 1, day_of_week: 'Wednesday', start_time: '09:00 AM', end_time: '05:00 PM', slot_duration_mins: 30, is_available: 1 },
        { id: 3, doctor_id: 1, day_of_week: 'Friday', start_time: '09:00 AM', end_time: '02:00 PM', slot_duration_mins: 30, is_available: 1 },
        { id: 4, doctor_id: 2, day_of_week: 'Tuesday', start_time: '10:00 AM', end_time: '06:00 PM', slot_duration_mins: 30, is_available: 1 },
        { id: 5, doctor_id: 2, day_of_week: 'Thursday', start_time: '10:00 AM', end_time: '06:00 PM', slot_duration_mins: 30, is_available: 1 },
        { id: 6, doctor_id: 3, day_of_week: 'Monday', start_time: '08:30 AM', end_time: '03:30 PM', slot_duration_mins: 30, is_available: 1 },
        { id: 7, doctor_id: 3, day_of_week: 'Thursday', start_time: '08:30 AM', end_time: '03:30 PM', slot_duration_mins: 30, is_available: 1 },
        { id: 8, doctor_id: 4, day_of_week: 'Tuesday', start_time: '09:00 AM', end_time: '04:00 PM', slot_duration_mins: 30, is_available: 1 },
        { id: 9, doctor_id: 4, day_of_week: 'Friday', start_time: '09:00 AM', end_time: '04:00 PM', slot_duration_mins: 30, is_available: 1 }
    ],
    appointments: [
        { id: 1, patient_id: 1, doctor_id: 1, appointment_date: '2026-08-28', appointment_time: '10:00 AM', status: 'confirmed', reason: 'Annual Cardiac Checkup', symptoms: 'Occasional palpitations after heavy exertion.', consultation_fee: 120.00, payment_status: 'paid', created_at: '2026-08-24T10:30:00Z' },
        { id: 2, patient_id: 1, doctor_id: 3, appointment_date: '2026-08-20', appointment_time: '02:30 PM', status: 'completed', reason: 'Skin Rash Consultation', symptoms: 'Dry itching patch on left forearm for 2 weeks.', consultation_fee: 95.00, payment_status: 'paid', created_at: '2026-08-18T14:15:00Z' },
        { id: 3, patient_id: 2, doctor_id: 2, appointment_date: '2026-08-30', appointment_time: '11:30 AM', status: 'pending', reason: 'Frequent Migraines', symptoms: 'Throbbing headache twice a week sensitive to light.', consultation_fee: 140.00, payment_status: 'paid', created_at: '2026-08-23T09:00:00Z' }
    ],
    medical_records: [
        { id: 1, appointment_id: 2, patient_id: 1, doctor_id: 3, diagnosis: 'Contact Dermatitis (Mild Eczema Flare-up)', prescription: 'Hydrocortisone 1% Cream (Apply twice daily for 7 days)\nCetirizine 10mg (1 tablet daily at bedtime)', lab_tests: 'Skin Patch Allergy Test recommended if rash recurs', doctor_notes: 'Patient responded well to topical treatment during follow-up call. Advised to avoid harsh soaps.', record_date: '2026-08-20T15:00:00Z' }
    ]
};

function loadLocalData() {
    if (!fs.existsSync(dataFilePath)) {
        fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    try {
        const raw = fs.readFileSync(dataFilePath, 'utf8');
        const parsed = JSON.parse(raw);

        // Ensure default admin credentials are up to date
        const adminUser = parsed.users.find(u => u.role === 'admin' || u.id === 1);
        if (adminUser) {
            adminUser.email = 'abikrish@gmail.com';
            adminUser.password = 'Abishek@2006';
            adminUser.full_name = 'Abishek (Admin)';
            saveData(parsed);
        }
        return parsed;
    } catch (e) {
        return initialData;
    }
}

function saveData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// Attempt MySQL connection if environment provides details
async function initMysql() {
    if (process.env.MYSQL_HOST) {
        try {
            mysqlPool = mysql.createPool({
                host: process.env.MYSQL_HOST || 'localhost',
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'hospital_db',
                port: process.env.MYSQL_PORT || 3306
            });
            await mysqlPool.query('SELECT 1');
            isMysqlActive = true;
            console.log('Connected to MySQL Database!');
        } catch (err) {
            console.log('MySQL server connection not active. Running seamlessly in high-speed JSON/SQL fallback mode!');
        }
    }
}

initMysql();

// Store API helper
const localStore = {
    getData: loadLocalData,
    saveData,

    getUsers: () => loadLocalData().users,
    addUser: (user) => {
        const data = loadLocalData();
        user.id = (data.users.reduce((max, u) => u.id > max ? u.id : max, 0)) + 1;
        user.created_at = new Date().toISOString();
        data.users.push(user);
        saveData(data);
        return user;
    },

    getDoctors: (filterSpec, search) => {
        const data = loadLocalData();
        return data.doctors.map(d => {
            const u = data.users.find(usr => usr.id === d.user_id) || {};
            return {
                ...d,
                full_name: u.full_name,
                email: u.email,
                phone: u.phone,
                avatar_url: u.avatar_url
            };
        }).filter(d => {
            if (d.status !== 'active') return false;
            if (filterSpec && filterSpec !== 'all' && d.specialization !== filterSpec) return false;
            if (search) {
                const s = search.toLowerCase();
                return d.full_name?.toLowerCase().includes(s) || 
                       d.specialization?.toLowerCase().includes(s) ||
                       d.qualification?.toLowerCase().includes(s);
            }
            return true;
        });
    },

    addDoctor: (userObj, doctorObj) => {
        const data = loadLocalData();
        userObj.id = (data.users.reduce((max, u) => u.id > max ? u.id : max, 0)) + 1;
        userObj.role = 'doctor';
        userObj.created_at = new Date().toISOString();
        data.users.push(userObj);

        doctorObj.id = (data.doctors.reduce((max, d) => d.id > max ? d.id : max, 0)) + 1;
        doctorObj.user_id = userObj.id;
        data.doctors.push(doctorObj);

        // Add schedules
        const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        let maxSchedId = data.schedules.reduce((max, s) => s.id > max ? s.id : max, 0);
        for (const day of defaultDays) {
            data.schedules.push({
                id: ++maxSchedId,
                doctor_id: doctorObj.id,
                day_of_week: day,
                start_time: '09:00 AM',
                end_time: '05:00 PM',
                slot_duration_mins: 30,
                is_available: 1
            });
        }

        saveData(data);
        return doctorObj;
    },

    updateDoctor: (id, userObj, doctorObj) => {
        const data = loadLocalData();
        const doc = data.doctors.find(d => d.id == id);
        if (!doc) return null;

        const u = data.users.find(usr => usr.id === doc.user_id);
        if (u) {
            if (userObj.full_name) u.full_name = userObj.full_name;
            if (userObj.email) u.email = userObj.email;
            if (userObj.password) u.password = userObj.password;
            if (userObj.phone) u.phone = userObj.phone;
        }

        if (doctorObj.specialization) doc.specialization = doctorObj.specialization;
        if (doctorObj.qualification) doc.qualification = doctorObj.qualification;
        if (doctorObj.experience_years !== undefined) doc.experience_years = doctorObj.experience_years;
        if (doctorObj.consultation_fee !== undefined) doc.consultation_fee = doctorObj.consultation_fee;
        if (doctorObj.room_number) doc.room_number = doctorObj.room_number;
        if (doctorObj.bio !== undefined) doc.bio = doctorObj.bio;

        saveData(data);
        return { ...doc, full_name: u?.full_name, email: u?.email, phone: u?.phone };
    },

    deleteDoctor: (id) => {
        const data = loadLocalData();
        const docIndex = data.doctors.findIndex(d => d.id == id);
        if (docIndex !== -1) {
            const doc = data.doctors[docIndex];
            data.doctors.splice(docIndex, 1);
            // Also remove from users table if user exists
            data.users = data.users.filter(u => u.id !== doc.user_id);
            // Remove doctor schedules
            data.schedules = data.schedules.filter(s => s.doctor_id != id);
            saveData(data);
        return true;
        }
        return false;
    },

    updatePatient: (id, userObj, patientObj) => {
        const data = loadLocalData();
        const pat = data.patients.find(p => p.id == id);
        if (!pat) return null;

        const u = data.users.find(usr => usr.id === pat.user_id);
        if (u) {
            if (userObj.full_name) u.full_name = userObj.full_name;
            if (userObj.email) u.email = userObj.email;
            if (userObj.password) u.password = userObj.password;
            if (userObj.phone) u.phone = userObj.phone;
        }

        if (patientObj.dob) pat.dob = patientObj.dob;
        if (patientObj.gender) pat.gender = patientObj.gender;
        if (patientObj.blood_group) pat.blood_group = patientObj.blood_group;
        if (patientObj.emergency_contact !== undefined) pat.emergency_contact = patientObj.emergency_contact;
        if (patientObj.address !== undefined) pat.address = patientObj.address;
        if (patientObj.medical_history_summary !== undefined) pat.medical_history_summary = patientObj.medical_history_summary;

        saveData(data);
        return { ...pat, full_name: u?.full_name, email: u?.email, phone: u?.phone };
    },

    deletePatient: (id) => {
        const data = loadLocalData();
        const patIndex = data.patients.findIndex(p => p.id == id);
        if (patIndex !== -1) {
            const pat = data.patients[patIndex];
            data.patients.splice(patIndex, 1);
            // Remove user account
            data.users = data.users.filter(u => u.id !== pat.user_id);
            // Remove associated appointments
            data.appointments = data.appointments.filter(a => a.patient_id != id);
            // Remove associated medical records
            data.medical_records = data.medical_records.filter(mr => mr.patient_id != id);
            saveData(data);
            return true;
        }
        return false;
    },

    getDoctorById: (id) => {
        const data = loadLocalData();
        const doc = data.doctors.find(d => d.id == id);
        if (!doc) return null;
        const u = data.users.find(usr => usr.id === doc.user_id) || {};
        const schedules = data.schedules.filter(s => s.doctor_id == id && s.is_available);
        return {
            ...doc,
            full_name: u.full_name,
            email: u.email,
            password: u.password || '',
            phone: u.phone,
            avatar_url: u.avatar_url,
            schedules
        };
    },

    getAppointments: (patientId, doctorId, status) => {
        const data = loadLocalData();
        return data.appointments.filter(a => {
            if (patientId && a.patient_id != patientId) return false;
            if (doctorId && a.doctor_id != doctorId) return false;
            if (status && a.status != status) return false;
            return true;
        }).map(a => {
            const pat = data.patients.find(p => p.id == a.patient_id);
            const patUser = pat ? data.users.find(u => u.id == pat.user_id) : null;
            const doc = data.doctors.find(d => d.id == a.doctor_id);
            const docUser = doc ? data.users.find(u => u.id == doc.user_id) : null;
            const record = data.medical_records.find(mr => mr.appointment_id == a.id);

            const resolvedName = a.patient_name || (patUser && patUser.full_name) || (pat && pat.full_name) || (patUser && patUser.email ? patUser.email.split('@')[0] : (pat && pat.email ? pat.email.split('@')[0] : `Patient`));
            const resolvedEmail = a.patient_email || (patUser && patUser.email) || (pat && pat.email) || 'N/A';
            const resolvedPhone = a.patient_phone || (patUser && patUser.phone) || (pat && pat.phone) || (pat && pat.emergency_contact) || 'N/A';
            const resolvedAvatar = a.patient_avatar || (patUser && patUser.avatar_url) || (pat && pat.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedName)}&background=0D8ABC&color=fff&size=150`;

            return {
                ...a,
                patient_name: resolvedName,
                patient_email: resolvedEmail,
                patient_phone: resolvedPhone,
                patient_avatar: resolvedAvatar,
                emergency_contact: pat ? pat.emergency_contact : '',
                doctor_name: docUser ? docUser.full_name : 'Doctor',
                specialization: doc ? doc.specialization : '',
                room_number: doc ? doc.room_number : '',
                doctor_avatar: docUser ? docUser.avatar_url : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
                medical_record_id: record ? record.id : null
            };
        }).sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
    },

    addAppointment: (apptObj) => {
        const data = loadLocalData();
        apptObj.id = (data.appointments.reduce((max, a) => a.id > max ? a.id : max, 0)) + 1;
        apptObj.created_at = new Date().toISOString();
        data.appointments.push(apptObj);
        saveData(data);
        return apptObj;
    },

    updateAppointment: (id, updateFields) => {
        const data = loadLocalData();
        const appt = data.appointments.find(a => a.id == id);
        if (appt) {
            Object.assign(appt, updateFields);
            saveData(data);
            return appt;
        }
        return null;
    },

    getMedicalRecords: (patientId, doctorId, appointmentId) => {
        const data = loadLocalData();
        return data.medical_records.filter(mr => {
            if (patientId && mr.patient_id != patientId) return false;
            if (doctorId && mr.doctor_id != doctorId) return false;
            if (appointmentId && mr.appointment_id != appointmentId) return false;
            return true;
        }).map(mr => {
            const appt = data.appointments.find(a => a.id == mr.appointment_id) || {};
            const pat = data.patients.find(p => p.id == mr.patient_id) || {};
            const patUser = data.users.find(u => u.id == pat.user_id) || {};
            const doc = data.doctors.find(d => d.id == mr.doctor_id) || {};
            const docUser = data.users.find(u => u.id == doc.user_id) || {};

            return {
                ...mr,
                appointment_date: appt.appointment_date,
                appointment_time: appt.appointment_time,
                reason: appt.reason,
                patient_name: patUser.full_name,
                patient_phone: patUser.phone,
                blood_group: pat.blood_group,
                dob: pat.dob,
                gender: pat.gender,
                doctor_name: docUser.full_name,
                specialization: doc.specialization,
                qualification: doc.qualification,
                room_number: doc.room_number
            };
        }).sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
    },

    addMedicalRecord: (recObj) => {
        const data = loadLocalData();

        // Update appointment details (including date and timing if changed by doctor)
        const appt = data.appointments.find(a => a.id == recObj.appointment_id);
        if (appt) {
            appt.status = 'completed';
            if (recObj.appointment_date) appt.appointment_date = recObj.appointment_date;
            if (recObj.appointment_time) appt.appointment_time = recObj.appointment_time;
        }

        const existingIndex = data.medical_records.findIndex(r => r.appointment_id == recObj.appointment_id);
        if (existingIndex !== -1) {
            const existing = data.medical_records[existingIndex];
            existing.diagnosis = recObj.diagnosis;
            existing.prescription = recObj.prescription;
            existing.lab_tests = recObj.lab_tests || 'None';
            existing.doctor_notes = recObj.doctor_notes || '';
            if (recObj.appointment_date) existing.appointment_date = recObj.appointment_date;
            if (recObj.appointment_time) existing.appointment_time = recObj.appointment_time;
            existing.record_date = new Date().toISOString();

            saveData(data);
            return existing;
        }

        recObj.id = (data.medical_records.reduce((max, r) => r.id > max ? r.id : max, 0)) + 1;
        recObj.record_date = new Date().toISOString();
        data.medical_records.push(recObj);

        saveData(data);
        return recObj;
    },

    updateMedicalRecord: (id, updateFields) => {
        const data = loadLocalData();
        const record = data.medical_records.find(r => r.id == id || r.appointment_id == id);
        if (record) {
            if (updateFields.diagnosis) record.diagnosis = updateFields.diagnosis;
            if (updateFields.prescription) record.prescription = updateFields.prescription;
            if (updateFields.lab_tests !== undefined) record.lab_tests = updateFields.lab_tests;
            if (updateFields.doctor_notes !== undefined) record.doctor_notes = updateFields.doctor_notes;
            if (updateFields.appointment_date) record.appointment_date = updateFields.appointment_date;
            if (updateFields.appointment_time) record.appointment_time = updateFields.appointment_time;

            const appt = data.appointments.find(a => a.id == record.appointment_id);
            if (appt) {
                if (updateFields.appointment_date) appt.appointment_date = updateFields.appointment_date;
                if (updateFields.appointment_time) appt.appointment_time = updateFields.appointment_time;
            }

            record.record_date = new Date().toISOString();
            saveData(data);
            return record;
        }
        return null;
    },

    getAdminStats: () => {
        const data = loadLocalData();
        const doctorsCount = data.doctors.length;
        const patientsCount = data.patients.length;
        const apptCount = data.appointments.length;
        const revenue = data.appointments.reduce((sum, a) => a.payment_status === 'paid' ? sum + (parseFloat(a.consultation_fee) || 0) : sum, 0);

        const specsMap = {};
        data.doctors.forEach(d => {
            specsMap[d.specialization] = (specsMap[d.specialization] || 0) + 1;
        });
        const specializations = Object.keys(specsMap).map(spec => ({ specialization: spec, count: specsMap[spec] }));

        const recentAppointments = localStore.getAppointments().slice(0, 5);

        return {
            doctors: doctorsCount,
            patients: patientsCount,
            appointments: apptCount,
            revenue,
            specializations,
            recentAppointments
        };
    }
};

module.exports = {
    getDbType: () => isMysqlActive ? 'MySQL' : 'SQLite/Local DB',
    store: localStore
};
