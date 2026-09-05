// HealthCare Pulse - Frontend Application Script with Dedicated Admin Portal & Patient Directory

let currentUser = null;
let allDoctors = [];
let specChartInstance = null;
let pendingBookingData = null;

// ON DOM LOAD
document.addEventListener('DOMContentLoaded', () => {
    checkSavedSession();
    loadDoctors();
    setupTheme();
});

// DYNAMIC ACCENT COLOR & BACKGROUND THEME CUSTOMIZER
function setAccentColor(primaryHex, hoverHex, lightHex) {
    document.documentElement.style.setProperty('--primary', primaryHex);
    document.documentElement.style.setProperty('--primary-hover', hoverHex);
    document.documentElement.style.setProperty('--primary-light', lightHex);

    document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
}

function changeBackgroundTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
}

// SESSION & NAVIGATION CONTROL
function checkSavedSession() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            applyUserSession();
        } catch (e) {
            showRoleSelectionScreen();
        }
    } else {
        showRoleSelectionScreen();
    }
}

function showRoleSelectionScreen() {
    document.getElementById('roleSelectionScreen').style.display = 'block';
    document.getElementById('patientView').style.display = 'none';
    document.getElementById('doctorView').style.display = 'none';
    document.getElementById('adminView').style.display = 'none';
    updateAuthUI();
}

function applyUserSession() {
    updateAuthUI();

    document.getElementById('roleSelectionScreen').style.display = 'none';
    document.getElementById('patientView').style.display = 'none';
    document.getElementById('doctorView').style.display = 'none';
    document.getElementById('adminView').style.display = 'none';

    if (currentUser.role === 'doctor') {
        document.getElementById('doctorView').style.display = 'block';
        document.getElementById('doctorWelcomeText').innerText = `Doctor Portal - ${currentUser.full_name} (My Patient List)`;
        loadDoctorQueue();
        loadDoctorSchedule();
    } else if (currentUser.role === 'admin') {
        document.getElementById('adminView').style.display = 'block';
        loadAdminDashboard();
    } else {
        // Patient Mode
        document.getElementById('patientView').style.display = 'block';
        document.getElementById('patientWelcomeText').innerText = `Welcome back, ${currentUser.full_name}`;
        loadDoctors();
        loadPatientAppointments();
        loadPatientMedicalRecords();
    }
}

function updateAuthUI() {
    const container = document.getElementById('authNavControls');
    if (currentUser && currentUser.email) {
        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--primary-light); padding: 0.35rem 0.85rem; border-radius: 30px;">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary);">${currentUser.full_name}</span>
                <span class="role-badge" style="margin-left: 0.25rem;">${currentUser.role}</span>
            </div>
            <button class="btn btn-outline btn-sm" onclick="logoutUser()">Logout</button>
        `;
    } else {
        container.innerHTML = `
            <button class="btn btn-primary btn-sm" onclick="openPatientLoginModal()">👤 Patient Sign In</button>
            <button class="btn btn-secondary btn-sm" onclick="openDoctorLoginModal()">🩺 Doctor Portal</button>
            <button class="btn btn-outline btn-sm" onclick="openAdminLoginModal()">🛡️ Admin Sign In</button>
        `;
    }
}

// SEPARATE ROLE LOGIN HANDLERS
function openPatientLoginModal() {
    closeModal('doctorLoginModal');
    closeModal('adminLoginModal');
    document.getElementById('patientLoginModal').classList.add('active');
}

function openDoctorLoginModal() {
    closeModal('patientLoginModal');
    closeModal('adminLoginModal');
    document.getElementById('doctorLoginModal').classList.add('active');
}

function openAdminLoginModal() {
    closeModal('patientLoginModal');
    closeModal('doctorLoginModal');
    document.getElementById('adminLoginModal').classList.add('active');
}

function openRegisterModal() {
    closeModal('patientLoginModal');
    closeModal('doctorLoginModal');
    closeModal('adminLoginModal');
    document.getElementById('registerModal').classList.add('active');
}

let pendingOtpEmail = '';
let pendingAuthAction = null;
let otpTimerInterval = null;

async function triggerPatientOtpVerification(email, onVerifiedCallback, purposeTitle) {
    try {
        const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, purpose: purposeTitle || 'Patient Verification' })
        });

        const data = await res.json();
        if (res.ok) {
            pendingOtpEmail = email;
            pendingAuthAction = onVerifiedCallback;

            document.getElementById('otpEmailTargetDisplay').innerText = email;
            document.getElementById('otpCodePreviewDisplay').innerText = data.otpCode;
            document.getElementById('otpCodeInput').value = '';

            closeModal('patientLoginModal');
            closeModal('registerModal');
            document.getElementById('otpModal').classList.add('active');

            startOtpCountdownTimer();
        } else {
            alert('Failed to send OTP: ' + data.error);
        }
    } catch (err) {
        alert('Error sending OTP: ' + err.message);
    }
}

function startOtpCountdownTimer() {
    let secondsLeft = 60;
    const timerSpan = document.getElementById('otpCountdownTimer');
    const resendBtn = document.getElementById('resendOtpBtn');
    
    resendBtn.disabled = true;
    if (otpTimerInterval) clearInterval(otpTimerInterval);

    otpTimerInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
            timerSpan.innerText = `Resend OTP in ${secondsLeft}s`;
        } else {
            clearInterval(otpTimerInterval);
            timerSpan.innerText = `OTP code expired or ready to resend`;
            resendBtn.disabled = false;
        }
    }, 1000);
}

async function resendPatientOtp() {
    if (!pendingOtpEmail) return;
    await triggerPatientOtpVerification(pendingOtpEmail, pendingAuthAction, 'Patient OTP Resend');
}

async function handleOtpVerifySubmit(e) {
    e.preventDefault();
    const otp = document.getElementById('otpCodeInput').value.trim();
    if (!pendingOtpEmail || !otp) return alert('Please enter 6-digit OTP code.');

    try {
        const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: pendingOtpEmail, otp })
        });

        const data = await res.json();
        if (res.ok) {
            closeModal('otpModal');
            if (otpTimerInterval) clearInterval(otpTimerInterval);

            if (typeof pendingAuthAction === 'function') {
                await pendingAuthAction();
            }
        } else {
            alert('OTP Verification Failed: ' + data.error);
        }
    } catch (err) {
        alert('Verification error: ' + err.message);
    }
}

async function handleRoleLogin(e, expectedRole) {
    e.preventDefault();
    let email = '', password = '';

    if (expectedRole === 'doctor') {
        email = document.getElementById('docEmailInput').value;
        password = document.getElementById('docPassInput').value;
    } else if (expectedRole === 'admin') {
        email = document.getElementById('adminEmailInput').value;
        password = document.getElementById('adminPassInput').value;
    } else {
        email = document.getElementById('patEmailInput').value;
        password = document.getElementById('patPassInput').value;
    }

    // Direct login API caller
    const performLoginCall = async () => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                closeModal('patientLoginModal');
                closeModal('doctorLoginModal');
                closeModal('adminLoginModal');
                applyUserSession();

                if (currentUser.role === 'admin') {
                    alert(`🛡️ Welcome Administrator ${currentUser.full_name}! Access granted to Admin Control Panel & Patient Database.`);
                } else if (currentUser.role === 'doctor') {
                    alert(`🩺 Welcome Dr. ${currentUser.full_name}! Loaded your daily Patient List.`);
                } else {
                    alert(`👤 OTP Verified! Welcome ${currentUser.full_name}! Accessing Patient Portal...`);
                }
            } else {
                alert('Login failed: ' + data.error);
            }
        } catch (err) {
            alert('Login error: ' + err.message);
        }
    };

    if (expectedRole === 'patient') {
        // Trigger Email OTP verification for patient login
        await triggerPatientOtpVerification(email, performLoginCall, 'Patient Sign In Verification');
    } else {
        await performLoginCall();
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const full_name = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;
    const dob = document.getElementById('regDob').value;
    const gender = document.getElementById('regGender').value;
    const blood_group = document.getElementById('regBlood').value;
    const address = document.getElementById('regAddress').value;

    const performRegisterCall = async () => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name, email, password, phone, dob, gender, blood_group, address })
            });

            const data = await res.json();
            if (res.ok) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                closeModal('registerModal');
                applyUserSession();
                alert(`🎉 Email Verified & Account Created! Welcome to HealthCare Pulse, ${full_name}.`);
            } else {
                alert('Registration failed: ' + data.error);
            }
        } catch (err) {
            alert('Registration error: ' + err.message);
        }
    };

    // Trigger Email OTP verification for patient registration
    await triggerPatientOtpVerification(email, performRegisterCall, 'Patient Account Registration');
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showRoleSelectionScreen();
    alert('You have logged out.');
}

function quickLoginDemo(role) {
    if (role === 'patient') {
        currentUser = {
            id: 6,
            full_name: 'John Doe',
            email: 'john.doe@gmail.com',
            role: 'patient',
            patient_id: 1,
            doctor_id: null,
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        };
    } else if (role === 'doctor') {
        currentUser = {
            id: 2,
            full_name: 'Dr. Sarah Jenkins',
            email: 'sarah.jenkins@hospital.com',
            role: 'doctor',
            patient_id: null,
            doctor_id: 1,
            avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'
        };
    } else if (role === 'admin') {
        currentUser = {
            id: 1,
            full_name: 'Abishek (Admin)',
            email: 'abikrish@gmail.com',
            role: 'admin',
            patient_id: null,
            doctor_id: null,
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    applyUserSession();
}

function setupTheme() {
    document.body.setAttribute('data-theme', 'light');
}


// --- PATIENT PORTAL FUNCTIONS ---
function showPatientViewTab(tab) {
    document.getElementById('doctorSearchTab').style.display = (tab === 'doctors') ? 'block' : 'none';
    document.getElementById('doctorsGridContainer').style.display = (tab === 'doctors') ? 'block' : 'none';
    document.getElementById('patientAppointmentsTab').style.display = (tab === 'my-appointments') ? 'block' : 'none';
    document.getElementById('patientMedicalRecordsTab').style.display = (tab === 'medical-records') ? 'block' : 'none';

    if (tab === 'my-appointments') loadPatientAppointments();
    if (tab === 'medical-records') loadPatientMedicalRecords();
}

async function loadDoctors() {
    try {
        const specSelect = document.getElementById('specializationSelect');
        const searchInput = document.getElementById('doctorSearchInput');
        const spec = specSelect ? specSelect.value : 'all';
        const search = searchInput ? searchInput.value : '';

        const res = await fetch(`/api/doctors?specialization=${spec}&search=${encodeURIComponent(search)}`);
        allDoctors = await res.json();
        renderDoctorsGrid(allDoctors);
    } catch (err) {
        console.error('Error loading doctors:', err);
    }
}

function filterDoctors() {
    loadDoctors();
}

function renderDoctorsGrid(doctors) {
    const grid = document.getElementById('doctorsGrid');
    if (!grid) return;

    if (!doctors || doctors.length === 0) {
        grid.innerHTML = `<div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">No doctors found matching criteria.</div>`;
        return;
    }

    grid.innerHTML = doctors.map(doc => `
        <div class="card doctor-card">
            <div class="rating-badge">★ ${doc.rating}</div>
            <div class="doctor-card-header">
                <div class="doctor-info">
                    <h3>${doc.full_name}</h3>
                    <div class="spec">${doc.specialization}</div>
                    <div class="qual">${doc.qualification} (${doc.experience_years} yrs exp)</div>
                </div>
            </div>
            <div class="doctor-card-body">
                <p style="margin-bottom: 0.5rem;">${doc.bio}</p>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">📍 Room: <strong>${doc.room_number}</strong></div>
            </div>
            <div class="doctor-meta">
                <div class="fee">₹${doc.consultation_fee} <span>/ visit</span></div>
                <button class="btn btn-primary btn-sm" onclick="openBookingModal(${doc.id}, '${doc.full_name}', ${doc.consultation_fee})">Book & Pay QR 💳</button>
            </div>
        </div>
    `).join('');
}

async function loadPatientAppointments() {
    try {
        const patId = currentUser ? (currentUser.patient_id || 1) : 1;
        const res = await fetch(`/api/appointments?patient_id=${patId}`);
        const appointments = await res.json();
        const tbody = document.getElementById('patientAppointmentsTable');

        if (!tbody) return;

        if (appointments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No booked appointments found.</td></tr>`;
            return;
        }

        tbody.innerHTML = appointments.map(a => `
            <tr>
                <td>
                    <strong>${a.doctor_name}</strong>
                </td>
                <td>${a.specialization}</td>
                <td>${a.appointment_date} <br><span style="font-size: 0.8rem; color: var(--text-secondary);">${a.appointment_time}</span></td>
                <td>${a.room_number || 'Suite 101'}</td>
                <td>
                    <strong>₹${a.consultation_fee}</strong>
                    <br><span style="font-size: 0.75rem; color: #16a34a; font-weight: 700;">✅ Paid (QR)</span>
                </td>
                <td><span class="badge badge-${a.status}">${a.status}</span></td>
                <td>
                    ${a.medical_record_id ? 
                        `<button class="btn btn-secondary btn-sm" onclick="viewMedicalRecord(${a.medical_record_id})">📄 View Rx</button>` :
                        a.status !== 'cancelled' ? `<button class="btn btn-outline btn-sm" onclick="cancelAppointment(${a.id})">Cancel</button>` : `<span style="color: var(--text-secondary); font-size: 0.8rem;">Cancelled</span>`
                    }
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading appointments:', err);
    }
}

async function loadPatientMedicalRecords() {
    try {
        const patId = currentUser ? (currentUser.patient_id || 1) : 1;
        const res = await fetch(`/api/medical-records?patient_id=${patId}`);
        const records = await res.json();
        const container = document.getElementById('patientRecordsList');

        if (!container) return;

        if (records.length === 0) {
            container.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No prescriptions or medical records filed yet.</p>`;
            return;
        }

        container.innerHTML = records.map(r => `
            <div style="border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div>
                        <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--primary);">${r.diagnosis}</h4>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">Prescribed by ${r.doctor_name} (${r.specialization}) on ${new Date(r.record_date).toLocaleDateString()}</span>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="viewMedicalRecord(${r.id})">Print / View Prescription</button>
                </div>
                <p style="font-size: 0.9rem; background: var(--primary-light); padding: 0.75rem; border-radius: 8px; font-family: monospace; white-space: pre-line;">💊 ${r.prescription}</p>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading medical records:', err);
    }
}

// BOOKING & DYNAMIC PAYMENT QR STEP HANDLERS
function openBookingModal(doctorId, doctorName, fee) {
    if (!currentUser || currentUser.role !== 'patient') {
        alert('Please sign in as a Patient to book an appointment.');
        openPatientLoginModal();
        return;
    }
    document.getElementById('bookDoctorId').value = doctorId;
    document.getElementById('bookDoctorName').value = doctorName;
    document.getElementById('bookDoctorFee').value = fee || 100;
    document.getElementById('bookingModal').classList.add('active');
}

function proceedToPaymentStep(e) {
    e.preventDefault();
    const doctor_id = document.getElementById('bookDoctorId').value;
    const doctor_name = document.getElementById('bookDoctorName').value;
    const fee = document.getElementById('bookDoctorFee').value;
    const appointment_date = document.getElementById('bookDate').value;
    const appointment_time = document.getElementById('bookTime').value;
    const reason = document.getElementById('bookReason').value;
    const symptoms = document.getElementById('bookSymptoms').value;

    pendingBookingData = {
        patient_id: currentUser ? (currentUser.patient_id || 1) : 1,
        doctor_id,
        doctor_name,
        fee,
        appointment_date,
        appointment_time,
        reason,
        symptoms
    };

    closeModal('bookingModal');

    // Populate Payment QR Modal
    document.getElementById('payAmountDisplay').innerText = `₹${fee}`;
    document.getElementById('payDoctorDisplay').innerText = `Doctor: ${doctor_name}`;
    document.getElementById('paymentQrModal').classList.add('active');

    regenerateQrCode();
}

// DYNAMIC REAL QR CODE GENERATOR
function regenerateQrCode() {
    if (!pendingBookingData) return;
    const upiId = document.getElementById('merchantUpiInput').value || 'hospital.health@upi';
    const amount = pendingBookingData.fee || '100';
    
    // Standard UPI Payment URI scheme
    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("HealthCare Pulse Hospital")}&am=${amount}&cu=INR&tn=${encodeURIComponent("Consultation " + pendingBookingData.doctor_name)}`;
    
    document.getElementById('upiStringPreview').innerText = `UPI String: ${upiString}`;

    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.innerHTML = '';

    if (window.QRCode) {
        new QRCode(qrContainer, {
            text: upiString,
            width: 200,
            height: 200,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
        qrContainer.innerHTML = `<img src="${qrUrl}" alt="Scan QR Code to Pay" style="width: 200px; height: 200px; border-radius: 8px;">`;
    }
}

async function handleFinalPaymentSubmit(e) {
    e.preventDefault();
    if (!pendingBookingData) return;

    const txnRef = document.getElementById('txnRefInput').value || `TXN-${Math.floor(Math.random()*899999 + 100000)}`;

    try {
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: pendingBookingData.patient_id,
                doctor_id: pendingBookingData.doctor_id,
                appointment_date: pendingBookingData.appointment_date,
                appointment_time: pendingBookingData.appointment_time,
                reason: pendingBookingData.reason,
                symptoms: pendingBookingData.symptoms,
                payment_status: 'paid',
                transaction_ref: txnRef
            })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`🎉 Payment Verified! Appointment booked successfully.\n\nTransaction Ref: ${txnRef}\nConsultation Fee Paid: ₹${pendingBookingData.fee}`);
            closeModal('paymentQrModal');
            pendingBookingData = null;
            showPatientViewTab('my-appointments');
        } else {
            alert('Error: ' + data.error);
        }
    } catch (err) {
        alert('Booking failed: ' + err.message);
    }
}

async function cancelAppointment(apptId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
        await fetch(`/api/appointments/${apptId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
        });
        loadPatientAppointments();
    } catch (err) {
        alert('Failed to cancel appointment');
    }
}


// --- DOCTOR PORTAL FUNCTIONS ---
function showDoctorTab(tab) {
    document.getElementById('doctorQueueTab').style.display = (tab === 'queue') ? 'block' : 'none';
    document.getElementById('doctorScheduleTab').style.display = (tab === 'schedule') ? 'block' : 'none';
}

let currentDoctorAppointments = [];

async function loadDoctorQueue() {
    try {
        const docId = currentUser ? (currentUser.doctor_id || 1) : 1;
        const res = await fetch(`/api/appointments?doctor_id=${docId}`);
        currentDoctorAppointments = await res.json();

        document.getElementById('docTotalAppts').innerText = currentDoctorAppointments.length;
        document.getElementById('docPendingAppts').innerText = currentDoctorAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
        document.getElementById('docCompletedAppts').innerText = currentDoctorAppointments.filter(a => a.status === 'completed').length;

        filterAndSortDoctorQueue();
    } catch (err) {
        console.error('Error loading doctor queue:', err);
    }
}

function filterAndSortDoctorQueue() {
    const dateInput = document.getElementById('docQueueDateFilter');
    const sortSelect = document.getElementById('docQueueSortSelect');
    const badgeSpan = document.getElementById('docQueueSummaryBadge');

    const selectedDate = dateInput ? dateInput.value : '';
    const selectedSort = sortSelect ? sortSelect.value : 'name-asc';

    let list = [...currentDoctorAppointments];

    // 1. FILTER BY PARTICULAR DATE IF SELECTED
    if (selectedDate) {
        list = list.filter(a => a.appointment_date === selectedDate);
    }

    // 2. SORT LIST BY SELECTED CRITERIA (NAME A-Z, NAME Z-A, TIME ASC, TIME DESC)
    list.sort((a, b) => {
        const nameA = (a.patient_name || '').toLowerCase();
        const nameB = (b.patient_name || '').toLowerCase();

        if (selectedSort === 'name-asc') {
            return nameA.localeCompare(nameB);
        } else if (selectedSort === 'name-desc') {
            return nameB.localeCompare(nameA);
        } else if (selectedSort === 'time-asc') {
            return new Date(`${a.appointment_date} ${a.appointment_time}`) - new Date(`${b.appointment_date} ${b.appointment_time}`);
        } else if (selectedSort === 'time-desc') {
            return new Date(`${b.appointment_date} ${b.appointment_time}`) - new Date(`${a.appointment_date} ${a.appointment_time}`);
        }
        return 0;
    });

    // 3. UPDATE SUMMARY BADGE TEXT
    if (badgeSpan) {
        const dateText = selectedDate ? `for ${selectedDate}` : `across all dates`;
        const sortLabel = sortSelect ? sortSelect.options[sortSelect.selectedIndex].text : '';
        badgeSpan.innerText = `Showing ${list.length} patient visit(s) ${dateText} | Sorted by ${sortLabel}`;
    }

    // 4. RENDER QUEUE TABLE
    const tbody = document.getElementById('doctorQueueTable');
    if (!tbody) return;

    if (list.length === 0) {
        const emptyMsg = selectedDate ? `No patients found for selected date (${selectedDate}).` : `No patient appointments in queue.`;
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 2rem;">${emptyMsg}</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(a => {
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.patient_name || 'Patient')}&background=0D8ABC&color=fff&size=150`;
        const avatarSrc = (a.patient_avatar && a.patient_avatar.trim()) ? a.patient_avatar : fallbackAvatar;
        const mobileNumber = a.patient_phone || a.emergency_contact || 'N/A';
        const emailSubtext = (a.patient_email && a.patient_email !== 'N/A' && a.patient_email !== '') ? `<br><span style="font-size: 0.78rem; color: var(--text-secondary);">${a.patient_email}</span>` : '';

        return `
        <tr>
            <td>
                <strong style="font-size: 0.95rem; color: var(--primary); font-weight: 700;">${a.patient_name || 'Patient'}</strong>
            </td>
            <td>
                <strong style="font-size: 0.9rem; color: var(--text-main); font-weight: 700;">📱 ${mobileNumber}</strong>
                ${emailSubtext}
            </td>
            <td>${a.appointment_date} <br><span style="font-size: 0.8rem; color: var(--text-secondary);">${a.appointment_time}</span></td>
            <td>
            <td>
                <span class="badge badge-${a.status}">${a.status}</span>
                <br><span style="font-size: 0.7rem; color: #16a34a; font-weight: 700;">Paid (QR)</span>
            </td>
            <td>
                <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                    <button class="btn btn-outline btn-sm" onclick="openPatientHistoryModal(${a.patient_id}, '${a.patient_name}')" style="font-size: 0.78rem; padding: 0.25rem 0.5rem;">📋 Past Rx History</button>
                    ${a.medical_record_id ? `
                        <button class="btn btn-secondary btn-sm" onclick="viewMedicalRecord(${a.medical_record_id})">📄 View Rx</button>
                        <button class="btn btn-primary btn-sm" onclick="openPrescriptionModal(${a.id}, ${a.patient_id}, ${a.medical_record_id})" style="background: #0284c7; border-color: #0284c7;">✏️ Edit Rx</button>
                    ` : a.status !== 'cancelled' ? `
                        <button class="btn btn-primary btn-sm" onclick="openPrescriptionModal(${a.id}, ${a.patient_id})">📝 Add Prescription</button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function resetDocQueueFilters() {
    const dateInput = document.getElementById('docQueueDateFilter');
    const sortSelect = document.getElementById('docQueueSortSelect');

    if (dateInput) dateInput.value = '';
    if (sortSelect) sortSelect.value = 'name-asc';

    filterAndSortDoctorQueue();
}

async function loadPastPrescriptionsForCheckup(patientId) {
    const container = document.getElementById('pastPrescriptionsContainer');
    if (!container) return;

    try {
        const res = await fetch(`/api/medical-records?patient_id=${patientId}`);
        const records = await res.json();

        if (records.length === 0) {
            container.innerHTML = `
                <div style="background: var(--primary-light); border: 1px dashed var(--primary); padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
                    <span>ℹ️</span> <span>First checkup visit for this patient. No prior prescriptions on record.</span>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="background: #f8fafc; border: 1px solid var(--border); padding: 0.85rem; border-radius: 10px;">
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <span>📋 PREVIOUS CHECKUP PRESCRIPTIONS (${records.length} Old Visit Record${records.length > 1 ? 's' : ''})</span>
                    <span style="font-weight: 600; text-transform: none; color: var(--text-secondary); font-size: 0.78rem;">Sorted by newest visit</span>
                </div>
                <div style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.6rem; padding-right: 0.3rem;">
                    ${records.map(r => `
                        <div style="background: white; border: 1px solid var(--border); padding: 0.65rem; border-radius: 8px; font-size: 0.82rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <strong>📅 ${r.appointment_date || new Date(r.record_date).toLocaleDateString()} (${r.appointment_time || ''})</strong>
                                <span style="color: var(--secondary); font-weight: 600;">Dr. ${r.doctor_name || 'Attending Physician'}</span>
                            </div>
                            <div style="color: var(--primary); font-weight: 600; margin-bottom: 0.25rem;">🩺 Diagnosis: ${r.diagnosis}</div>
                            <div style="background: #f1f5f9; padding: 0.35rem 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.8rem; margin-bottom: 0.25rem; white-space: pre-line;">💊 Rx Medicines: ${r.prescription}</div>
                            ${r.lab_tests && r.lab_tests !== 'None' ? `<div style="font-size: 0.78rem; color: #d97706;">🧪 Lab Tests: ${r.lab_tests}</div>` : ''}
                            ${r.doctor_notes ? `<div style="font-size: 0.78rem; color: var(--text-secondary); font-style: italic;">📝 Advice: "${r.doctor_notes}"</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (err) {
        console.error('Error loading past prescriptions:', err);
    }
}

async function openPrescriptionModal(apptId, patientId, recordId) {
    document.getElementById('prescApptId').value = apptId;
    document.getElementById('prescPatientId').value = patientId;

    // Load past prescriptions for patient checkup context
    await loadPastPrescriptionsForCheckup(patientId);

    const titleEl = document.getElementById('prescriptionModalTitle');
    const submitBtn = document.getElementById('prescSubmitBtn');
    const dateInput = document.getElementById('prescDateInput');
    const timeInput = document.getElementById('prescTimeInput');

    // Reset inputs
    document.getElementById('prescDiagnosis').value = '';
    document.getElementById('prescMedications').value = '';
    document.getElementById('prescLabTests').value = '';
    document.getElementById('prescDoctorNotes').value = '';

    // Find appointment details to pre-fill Date & Time
    const appt = currentDoctorAppointments.find(a => a.id == apptId) || {};
    const visitDate = appt.appointment_date || new Date().toISOString().split('T')[0];
    const visitTime = appt.appointment_time || '09:00 AM';

    if (dateInput) dateInput.value = visitDate;
    if (timeInput) timeInput.value = visitTime;

    // Check if editing existing prescription for this appointment
    try {
        const res = await fetch(`/api/medical-records?appointment_id=${apptId}`);
        const records = await res.json();
        
        if (records && records.length > 0) {
            const r = records[0];
            document.getElementById('prescDiagnosis').value = r.diagnosis || '';
            document.getElementById('prescMedications').value = r.prescription || '';
            document.getElementById('prescLabTests').value = r.lab_tests !== 'None' ? (r.lab_tests || '') : '';
            document.getElementById('prescDoctorNotes').value = r.doctor_notes || '';

            if (r.appointment_date && dateInput) dateInput.value = r.appointment_date;
            if (r.appointment_time && timeInput) timeInput.value = r.appointment_time;

            if (titleEl) titleEl.innerText = `✏️ Edit Patient Prescription & Timing`;
            if (submitBtn) submitBtn.innerText = `Save & Update Prescription & Timing`;
        } else {
            if (titleEl) titleEl.innerText = `📝 Issue Medical Record & Prescription`;
            if (submitBtn) submitBtn.innerText = `Save Record & Complete Appointment`;
        }
    } catch (e) {
        console.error('Error fetching prescription details for edit:', e);
    }

    document.getElementById('prescriptionModal').classList.add('active');
}

async function openPatientHistoryModal(patientId, patientName) {
    const titleEl = document.getElementById('historyPatientNameTitle');
    const contentEl = document.getElementById('patientHistoryContent');

    if (titleEl) titleEl.innerText = `📋 ${patientName}'s Medical Profile & Prescriptions`;

    try {
        // Fetch patient details and medical records
        const [patRes, recRes] = await Promise.all([
            fetch(`/api/admin/patients/${patientId}`).catch(() => null),
            fetch(`/api/medical-records?patient_id=${patientId}`)
        ]);

        const pat = patRes && patRes.ok ? await patRes.json() : null;
        const records = await recRes.json();

        let profileHeaderHtml = '';
        if (pat) {
            profileHeaderHtml = `
                <div style="background: var(--primary-light); border: 1.5px solid var(--primary); padding: 1.15rem; border-radius: 12px; margin-bottom: 1.25rem;">
                    <div style="font-size: 0.85rem; font-weight: 800; color: var(--primary); text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 0.05rem; display: flex; justify-content: space-between; align-items: center;">
                        <span>👤 PATIENT PERSONAL DETAILS & ACCOUNT CREDENTIALS</span>
                        <span class="role-badge" style="background: white; color: var(--primary); font-size: 0.75rem;">PAT-${pat.id}</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.88rem; color: var(--text-primary);">
                        <div style="background: white; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
                            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600;">FULL NAME</span>
                            <strong>${pat.full_name || patientName}</strong>
                        </div>
                        <div style="background: white; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
                            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600;">EMAIL LOGIN</span>
                            <strong>${pat.email || 'N/A'}</strong>
                        </div>
                        <div style="background: white; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
                            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600;">ACCOUNT PASSWORD</span>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <input type="password" id="patViewPass_${pat.id}" value="${pat.password || '••••••••'}" readonly style="border: none; background: transparent; font-family: monospace; font-weight: 700; font-size: 0.9rem; width: 120px; color: var(--primary);">
                                <button type="button" onclick="togglePasswordInput('patViewPass_${pat.id}', this)" style="background: none; border: none; cursor: pointer; font-size: 0.9rem;" title="Show/Hide Password">👁️</button>
                            </div>
                        </div>
                        <div style="background: white; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
                            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600;">MOBILE PHONE</span>
                            <strong>${pat.phone || 'N/A'}</strong>
                        </div>
                        <div style="background: white; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
                            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600;">DATE OF BIRTH & GENDER</span>
                            <strong>${pat.dob || 'N/A'} (${pat.gender || 'N/A'})</strong>
                        </div>
                        <div style="background: white; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
                            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600;">BLOOD GROUP</span>
                            <strong style="color: #e11d48;">${pat.blood_group || 'O+'}</strong>
                        </div>
                        <div style="background: white; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
                            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600;">EMERGENCY CONTACT</span>
                            <strong>${pat.emergency_contact || 'N/A'}</strong>
                        </div>
                        <div style="background: white; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
                            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600;">HOME ADDRESS</span>
                            <strong>${pat.address || 'N/A'}</strong>
                        </div>
                    </div>
                    
                    <div style="margin-top: 0.75rem; background: white; padding: 0.6rem 0.75rem; border-radius: 6px; border: 1px solid var(--border); font-size: 0.85rem;">
                        <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600;">MEDICAL HISTORY & CHRONIC CONDITIONS</span>
                        <span>${pat.medical_history_summary || 'None recorded'}</span>
                    </div>
                </div>
            `;
        }

        if (records.length === 0) {
            contentEl.innerHTML = profileHeaderHtml + `
                <div style="text-align: center; padding: 2rem 1rem; color: var(--text-secondary); background: white; border: 1px solid var(--border); border-radius: 10px;">
                    <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📁</div>
                    <div style="font-size: 0.95rem; font-weight: 600;">No Prescriptions Issued Yet</div>
                    <p style="font-size: 0.82rem; margin-top: 0.25rem;">This patient does not have any clinical prescriptions filed on record.</p>
                </div>
            `;
        } else {
            contentEl.innerHTML = profileHeaderHtml + `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${records.map((r, idx) => `
                        <div style="background: white; border: 1px solid var(--border); border-left: 4px solid var(--primary); padding: 1rem; border-radius: 10px; box-shadow: var(--shadow);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
                                <div>
                                    <strong style="font-size: 1rem; color: var(--primary);">Visit #${records.length - idx} &bull; ${r.appointment_date || new Date(r.record_date).toLocaleDateString()}</strong>
                                    <span style="font-size: 0.8rem; color: var(--text-secondary); margin-left: 0.5rem;">(${r.appointment_time || ''})</span>
                                </div>
                                <span class="role-badge" style="background: var(--primary-light); color: var(--primary);">Dr. ${r.doctor_name} (${r.specialization || 'Medicine'})</span>
                            </div>

                            <div style="margin-bottom: 0.6rem;">
                                <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">CLINICAL DIAGNOSIS</div>
                                <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">🩺 ${r.diagnosis}</div>
                            </div>

                            <div style="margin-bottom: 0.6rem;">
                                <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">PRESCRIBED MEDICATIONS & DOSAGE</div>
                                <div style="background: #f8fafc; border: 1px solid var(--border); padding: 0.75rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem; white-space: pre-line; color: #0f172a;">${r.prescription}</div>
                            </div>

                            ${r.lab_tests && r.lab_tests !== 'None' ? `
                                <div style="margin-bottom: 0.6rem;">
                                    <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">LAB & DIAGNOSTIC TESTS</div>
                                    <div style="font-size: 0.88rem; font-weight: 600; color: #d97706;">🧪 ${r.lab_tests}</div>
                                </div>
                            ` : ''}

                            ${r.doctor_notes ? `
                                <div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">DOCTOR'S ADVICE & NOTES</div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary); font-style: italic;">"${r.doctor_notes}"</div>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        document.getElementById('patientHistoryModal').classList.add('active');
    } catch (err) {
        alert('Failed to load patient history: ' + err.message);
    }
}

async function loadDoctorSchedule() {
    try {
        const docId = currentUser ? (currentUser.doctor_id || 1) : 1;
        const res = await fetch(`/api/doctors/${docId}/schedules`);
        const schedules = await res.json();
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const form = document.getElementById('scheduleSlotsForm');
        form.innerHTML = days.map(day => {
            const s = schedules.find(sched => sched.day_of_week === day) || { start_time: '09:00 AM', end_time: '05:00 PM', is_available: 1 };
            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--border);">
                    <div style="width: 120px; font-weight: 600;">${day}</div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <input type="text" class="input" style="width: 110px;" value="${s.start_time}" id="start_${day}">
                        <span>to</span>
                        <input type="text" class="input" style="width: 110px;" value="${s.end_time}" id="end_${day}">
                    </div>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="checkbox" id="avail_${day}" ${s.is_available ? 'checked' : ''}> Available
                    </label>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading schedule:', err);
    }
}

async function saveDoctorSchedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const docId = currentUser ? (currentUser.doctor_id || 1) : 1;
    const schedules = days.map(day => ({
        day_of_week: day,
        start_time: document.getElementById(`start_${day}`).value,
        end_time: document.getElementById(`end_${day}`).value,
        is_available: document.getElementById(`avail_${day}`).checked ? 1 : 0
    }));

    try {
        await fetch(`/api/doctors/${docId}/schedules`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schedules })
        });
        alert('Doctor schedule saved successfully!');
    } catch (err) {
        alert('Failed to save schedule');
    }
}

async function handlePrescriptionSubmit(e) {
    e.preventDefault();
    const appointment_id = document.getElementById('prescApptId').value;
    const patient_id = document.getElementById('prescPatientId').value;
    const appointment_date = document.getElementById('prescDateInput').value;
    const appointment_time = document.getElementById('prescTimeInput').value;
    const diagnosis = document.getElementById('prescDiagnosis').value;
    const prescription = document.getElementById('prescMedications').value;
    const lab_tests = document.getElementById('prescLabTests').value;
    const doctor_notes = document.getElementById('prescDoctorNotes').value;

    try {
        const res = await fetch('/api/medical-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                appointment_id,
                patient_id,
                doctor_id: currentUser ? (currentUser.doctor_id || 1) : 1,
                diagnosis,
                prescription,
                lab_tests,
                doctor_notes,
                appointment_date,
                appointment_time
            })
        });

        if (res.ok) {
            alert('✅ Prescription & Consultation Timing updated successfully!');
            closeModal('prescriptionModal');
            loadDoctorQueue();
        } else {
            const data = await res.json();
            alert('Error saving prescription: ' + data.error);
        }
    } catch (err) {
        alert('Error filing prescription: ' + err.message);
    }
}

// VIEW PRESCRIPTION DETAIL
async function viewMedicalRecord(recordId) {
    try {
        const res = await fetch(`/api/medical-records?appointment_id=${recordId}`);
        let records = await res.json();
        if (records.length === 0) {
            const fallbackRes = await fetch(`/api/medical-records`);
            const allRecs = await fallbackRes.json();
            records = allRecs.filter(r => r.id == recordId);
        }

        if (records.length === 0) return alert('Record not found');
        const r = records[0];

        document.getElementById('viewRecordContent').innerHTML = `
            <div style="background: white; border: 1px solid var(--border); padding: 0.65rem 0.85rem; border-radius: 8px; font-size: 0.85rem; color: var(--primary); font-weight: 700; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span>📅 Visit Date: <strong>${r.appointment_date || new Date(r.record_date).toLocaleDateString()}</strong></span>
                <span>⏰ Consultation Time: <strong>${r.appointment_time || 'N/A'}</strong></span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: var(--primary-light); padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem;">
                <div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">PATIENT DETAILS</div>
                    <strong style="font-size: 1.05rem;">${r.patient_name}</strong>
                    <div style="font-size: 0.85rem;">Blood Group: <strong>${r.blood_group || 'O+'}</strong> | Phone: ${r.patient_phone || 'N/A'}</div>
                </div>
                <div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">ATTENDING DOCTOR</div>
                    <strong style="font-size: 1.05rem;">${r.doctor_name}</strong>
                    <div style="font-size: 0.85rem;">${r.specialization} (${r.qualification})</div>
                </div>
            </div>

            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.25rem;">DIAGNOSIS</h4>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${r.diagnosis}</div>
            </div>

            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Rx PRESCRIBED MEDICATIONS</h4>
                <div style="background: var(--bg-body); border: 1px solid var(--border); padding: 1rem; border-radius: 8px; font-family: monospace; white-space: pre-line; font-size: 0.95rem;">${r.prescription}</div>
            </div>

            ${r.lab_tests ? `
                <div style="margin-bottom: 1rem;">
                    <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.25rem;">LAB / DIAGNOSTIC TESTS ADVISED</h4>
                    <div style="font-size: 0.95rem; font-weight: 600;">🧪 ${r.lab_tests}</div>
                </div>
            ` : ''}

            ${r.doctor_notes ? `
                <div style="margin-bottom: 1rem;">
                    <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.25rem;">DOCTOR'S ADVICE</h4>
                    <div style="font-size: 0.9rem; color: var(--text-secondary); font-style: italic;">"${r.doctor_notes}"</div>
                </div>
            ` : ''}
        `;

        document.getElementById('viewRecordModal').classList.add('active');
    } catch (err) {
        console.error('Error opening prescription view:', err);
    }
}


// --- ADMIN PORTAL EXCLUSIVE FUNCTIONS ---
function showAdminTab(tab) {
    document.getElementById('adminOverviewTab').style.display = (tab === 'overview') ? 'block' : 'none';
    document.getElementById('adminPatientsListTab').style.display = (tab === 'patients-list') ? 'block' : 'none';
    document.getElementById('adminDoctorsListTab').style.display = (tab === 'doctors-list') ? 'block' : 'none';

    // Update tab button highlights naturally
    const btnOverview = document.getElementById('adminTabOverview');
    const btnDoctors = document.getElementById('adminTabDoctors');
    const btnPatients = document.getElementById('adminTabPatients');

    if (btnOverview) btnOverview.className = (tab === 'overview') ? 'btn btn-secondary' : 'btn btn-outline';
    if (btnDoctors) btnDoctors.className = (tab === 'doctors-list') ? 'btn btn-secondary' : 'btn btn-outline';
    if (btnPatients) btnPatients.className = (tab === 'patients-list') ? 'btn btn-secondary' : 'btn btn-outline';

    if (tab === 'patients-list') loadAdminPatientsList();
    if (tab === 'doctors-list') loadAdminDoctorsList();
}

async function loadAdminDashboard() {
    try {
        const res = await fetch('/api/admin/stats');
        const stats = await res.json();

        document.getElementById('adminDoctorsCount').innerText = stats.doctors;
        document.getElementById('adminPatientsCount').innerText = stats.patients;
        document.getElementById('adminAppointmentsCount').innerText = stats.appointments;
        document.getElementById('adminRevenueCount').innerText = `₹${stats.revenue.toLocaleString()}`;

        // Recent Appointments Table
        const tbody = document.getElementById('adminRecentApptsTable');
        tbody.innerHTML = stats.recentAppointments.map(a => `
            <tr>
                <td><strong>${a.patient_name}</strong></td>
                <td>${a.doctor_name}</td>
                <td>${a.specialization}</td>
                <td>${a.appointment_date}</td>
                <td><span class="badge badge-${a.status}">${a.status}</span></td>
                <td>
                    ${a.medical_record_id ? `
                        <button class="btn btn-secondary btn-sm" onclick="viewMedicalRecord(${a.medical_record_id})" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;">📄 View Rx</button>
                    ` : `
                        <button class="btn btn-outline btn-sm" onclick="openPatientHistoryModal(${a.patient_id}, '${a.patient_name}')" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;">📋 Rx History</button>
                    `}
                </td>
            </tr>
        `).join('');

        // Specializations Chart
        renderSpecChart(stats.specializations);
    } catch (err) {
        console.error('Error loading admin dashboard:', err);
    }
}

async function loadAdminDoctorsList() {
    try {
        const res = await fetch('/api/doctors');
        const doctors = await res.json();
        const tbody = document.getElementById('adminDoctorsTable');

        if (!tbody) return;

        if (doctors.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No doctors registered in hospital system.</td></tr>`;
            return;
        }

        tbody.innerHTML = doctors.map(d => `
            <tr>
                <td><strong>DOC-${d.id}</strong></td>
                <td>
                    <strong>${d.full_name}</strong>
                </td>
                <td>${d.email}<br><span style="font-size: 0.8rem; color: var(--text-secondary);">${d.phone || 'N/A'}</span></td>
                <td><span class="role-badge" style="background: var(--primary-light); color: var(--primary);">${d.specialization}</span></td>
                <td>${d.room_number}<br><span style="font-size: 0.8rem; color: #16a34a; font-weight: 700;">₹${d.consultation_fee}/visit</span></td>
                <td>${d.experience_years} Years</td>
                <td>
                    <div style="display: flex; gap: 0.35rem;">
                        <button class="btn btn-secondary btn-sm" onclick="openEditDoctorModal(${d.id})">✏️ Edit Details</button>
                        <button class="btn btn-outline btn-sm" style="color: #e11d48; border-color: #e11d48;" onclick="removeDoctor(${d.id}, '${d.full_name}')">🗑️ Remove Access</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading admin doctors list:', err);
    }
}

function togglePasswordInput(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerText = '🙈';
    } else {
        input.type = 'password';
        btn.innerText = '👁️';
    }
}

async function openEditDoctorModal(doctorId) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access Denied: Only Hospital Administrators can edit doctor details.');
        return;
    }

    try {
        const res = await fetch(`/api/doctors/${doctorId}`);
        const doc = await res.json();

        document.getElementById('editDocId').value = doc.id;
        document.getElementById('editDocName').value = doc.full_name || '';
        document.getElementById('editDocEmail').value = doc.email || '';
        document.getElementById('editDocPassword').value = doc.password || '';
        document.getElementById('editDocPhone').value = doc.phone || '';
        document.getElementById('editDocSpec').value = doc.specialization || 'Cardiology';
        document.getElementById('editDocQual').value = doc.qualification || '';
        document.getElementById('editDocExp').value = doc.experience_years || 5;
        document.getElementById('editDocFee').value = doc.consultation_fee || 100;
        document.getElementById('editDocRoom').value = doc.room_number || '';
        document.getElementById('editDocBio').value = doc.bio || '';

        document.getElementById('editDoctorModal').classList.add('active');
    } catch (err) {
        alert('Failed to load doctor details: ' + err.message);
    }
}

async function handleEditDoctorSubmit(e) {
    e.preventDefault();
    const docId = document.getElementById('editDocId').value;
    const full_name = document.getElementById('editDocName').value;
    const email = document.getElementById('editDocEmail').value;
    const password = document.getElementById('editDocPassword').value;
    const phone = document.getElementById('editDocPhone').value;
    const specialization = document.getElementById('editDocSpec').value;
    const qualification = document.getElementById('editDocQual').value;
    const experience_years = document.getElementById('editDocExp').value;
    const consultation_fee = document.getElementById('editDocFee').value;
    const room_number = document.getElementById('editDocRoom').value;
    const bio = document.getElementById('editDocBio').value;

    try {
        const res = await fetch(`/api/admin/doctors/${docId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password, phone, specialization, qualification, experience_years, consultation_fee, room_number, bio })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`✅ ${full_name}'s profile details updated successfully!`);
            closeModal('editDoctorModal');
            loadAdminDoctorsList();
            loadAdminDashboard();
            loadDoctors();
        } else {
            alert('Failed to update doctor: ' + data.error);
        }
    } catch (err) {
        alert('Failed to update doctor: ' + err.message);
    }
}

async function removeDoctor(doctorId, doctorName) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access Denied: Only Hospital Administrators can remove doctor access.');
        return;
    }

    if (!confirm(`⚠️ Are you sure you want to remove access for ${doctorName} (DOC-${doctorId})?\n\nThis will revoke their login access and remove them from the hospital roster.`)) {
        return;
    }

    try {
        const res = await fetch(`/api/admin/doctors/${doctorId}`, {
            method: 'DELETE'
        });

        const data = await res.json();
        if (res.ok) {
            alert(`✅ ${doctorName} has been removed from the hospital doctor roster.`);
            loadAdminDoctorsList();
            loadAdminDashboard();
            loadDoctors();
        } else {
            alert('Error removing doctor: ' + data.error);
        }
    } catch (err) {
        alert('Failed to remove doctor: ' + err.message);
    }
}

async function loadAdminPatientsList() {
    try {
        const res = await fetch('/api/admin/patients');
        const patients = await res.json();
        const tbody = document.getElementById('adminPatientsTable');

        if (patients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-secondary);">No registered patients found in hospital system.</td></tr>`;
            return;
        }

        tbody.innerHTML = patients.map(p => `
            <tr>
                <td><strong>PAT-${p.id}</strong></td>
                <td><strong>${p.full_name}</strong></td>
                <td>${p.email}<br><span style="font-size: 0.8rem; color: var(--text-secondary);">${p.phone || 'N/A'}</span></td>
                <td>${p.dob || '1995-01-01'} (${p.gender || 'Other'})</td>
                <td><span style="font-weight: 700; color: #e11d48;">${p.blood_group || 'O+'}</span></td>
                <td>${p.emergency_contact || p.phone}</td>
                <td><strong>${p.appointments_count} visits</strong></td>
                <td>
                    <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                        <button class="btn btn-primary btn-sm" onclick="openPatientHistoryModal(${p.id}, '${p.full_name}')" style="font-size: 0.78rem;">👤 Personal Details & Prescriptions</button>
                        <button class="btn btn-outline btn-sm" style="color: #e11d48; border-color: #e11d48; font-size: 0.78rem;" onclick="removePatient(${p.id}, '${p.full_name}')">🗑️ Remove</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading admin patients list:', err);
    }
}

async function removePatient(patientId, patientName) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access Denied: Only Hospital Administrators can remove patient registrations.');
        return;
    }

    if (!confirm(`⚠️ Are you sure you want to remove registration for ${patientName} (PAT-${patientId})?\n\nThis will delete their patient account, login access, and medical history records.`)) {
        return;
    }

    try {
        const res = await fetch(`/api/admin/patients/${patientId}`, {
            method: 'DELETE'
        });

        const data = await res.json();
        if (res.ok) {
            alert(`✅ ${patientName}'s registration has been removed from the hospital system.`);
            loadAdminPatientsList();
            loadAdminDashboard();
        } else {
            alert('Error removing patient: ' + data.error);
        }
    } catch (err) {
        alert('Failed to remove patient: ' + err.message);
    }
}

async function openEditPatientModal(patientId) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access Denied: Only Hospital Administrators can edit patient registration details.');
        return;
    }

    try {
        const res = await fetch(`/api/admin/patients/${patientId}`);
        const pat = await res.json();

        document.getElementById('editPatId').value = pat.id;
        document.getElementById('editPatName').value = pat.full_name || '';
        document.getElementById('editPatEmail').value = pat.email || '';
        document.getElementById('editPatPassword').value = pat.password || '';
        document.getElementById('editPatPhone').value = pat.phone || '';
        document.getElementById('editPatDob').value = pat.dob || '1995-01-01';
        document.getElementById('editPatGender').value = pat.gender || 'Male';
        document.getElementById('editPatBlood').value = pat.blood_group || 'O+';
        document.getElementById('editPatEmergency').value = pat.emergency_contact || '';
        document.getElementById('editPatAddress').value = pat.address || '';
        document.getElementById('editPatMedicalHistory').value = pat.medical_history_summary || '';

        document.getElementById('editPatientModal').classList.add('active');
    } catch (err) {
        alert('Failed to load patient registration details: ' + err.message);
    }
}

async function handleEditPatientSubmit(e) {
    e.preventDefault();
    const patId = document.getElementById('editPatId').value;
    const full_name = document.getElementById('editPatName').value;
    const email = document.getElementById('editPatEmail').value;
    const password = document.getElementById('editPatPassword').value;
    const phone = document.getElementById('editPatPhone').value;
    const dob = document.getElementById('editPatDob').value;
    const gender = document.getElementById('editPatGender').value;
    const blood_group = document.getElementById('editPatBlood').value;
    const emergency_contact = document.getElementById('editPatEmergency').value;
    const address = document.getElementById('editPatAddress').value;
    const medical_history_summary = document.getElementById('editPatMedicalHistory').value;

    try {
        const res = await fetch(`/api/admin/patients/${patId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password, phone, dob, gender, blood_group, emergency_contact, address, medical_history_summary })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`✅ ${full_name}'s registration details updated successfully!`);
            closeModal('editPatientModal');
            loadAdminPatientsList();
        } else {
            alert('Failed to update patient details: ' + data.error);
        }
    } catch (err) {
        alert('Failed to update patient details: ' + err.message);
    }
}

function renderSpecChart(specData) {
    const ctx = document.getElementById('specChart').getContext('2d');
    if (specChartInstance) specChartInstance.destroy();

    specChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: specData.map(s => s.specialization),
            datasets: [{
                data: specData.map(s => s.count),
                backgroundColor: ['#2563eb', '#0d9488', '#8b5cf6', '#f59e0b', '#10b981']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function openAddDoctorModal() {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access Denied: Only Hospital Administrators can appoint doctors.');
        openAdminLoginModal();
        return;
    }
    const form = document.getElementById('addDoctorForm');
    if (form) form.reset();
    document.getElementById('addDoctorModal').classList.add('active');
}

async function handleAddDoctorSubmit(e) {
    e.preventDefault();
    const full_name = document.getElementById('addDocName').value;
    const email = document.getElementById('addDocEmail').value;
    const password = document.getElementById('addDocPassword').value;
    const phone = document.getElementById('addDocPhone').value;
    const specialization = document.getElementById('addDocSpec').value;
    const qualification = document.getElementById('addDocQual').value;
    const experience_years = document.getElementById('addDocExp').value;
    const consultation_fee = document.getElementById('addDocFee').value;
    const room_number = document.getElementById('addDocRoom').value;
    const bio = document.getElementById('addDocBio').value;

    try {
        const res = await fetch('/api/admin/doctors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password, phone, specialization, qualification, experience_years, consultation_fee, room_number, bio })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`🎉 Doctor Appointed & Account Generated!\n\nDoctor ID: DOC-${data.doctor.doctor_id}\nEmail: ${data.doctor.email}\nPassword: ${data.doctor.password}\nSpecialization: ${data.doctor.specialization}`);
            closeModal('addDoctorModal');
            loadAdminDashboard();
        } else {
            alert('Failed to add doctor: ' + data.error);
        }
    } catch (err) {
        alert('Failed to add doctor: ' + err.message);
    }
}

// GENERAL MODAL CLOSER
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}
