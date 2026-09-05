/**
 * MediCare Hub - Hospital Appointment System Application Engine
 * Vanilla ES6+ JavaScript
 */

(function () {
  'use strict';

  // ==========================================
  // 1. DATA MODELS & SEEDED DATABASE
  // ==========================================

  const DEPARTMENTS = [
    {
      id: 'dept-cardiology',
      name: 'Cardiology',
      icon: 'fa-heart-pulse',
      description: 'Heart care, cardiovascular diseases, hypertension, and arrhythmia treatments.',
      doctorCount: 4
    },
    {
      id: 'dept-neurology',
      name: 'Neurology',
      icon: 'fa-brain',
      description: 'Brain, spinal cord, nerve disorders, migraine, and neuro-rehabilitation.',
      doctorCount: 3
    },
    {
      id: 'dept-pediatrics',
      name: 'Pediatrics',
      icon: 'fa-baby',
      description: 'Comprehensive health care for infants, children, and adolescents.',
      doctorCount: 4
    },
    {
      id: 'dept-orthopedics',
      name: 'Orthopedics',
      icon: 'fa-bone',
      description: 'Bone fractures, joint replacements, sports injuries, and spine care.',
      doctorCount: 3
    },
    {
      id: 'dept-dermatology',
      name: 'Dermatology',
      icon: 'fa-allergies',
      description: 'Skin conditions, acne, eczema, psoriasis, and cosmetic dermatology.',
      doctorCount: 3
    },
    {
      id: 'dept-general',
      name: 'General Medicine',
      icon: 'fa-stethoscope',
      description: 'Primary healthcare, routine wellness checkups, and chronic disease control.',
      doctorCount: 5
    },
    {
      id: 'dept-ophthalmology',
      name: 'Ophthalmology',
      icon: 'fa-eye',
      description: 'Eye examinations, vision correction, cataract surgery, and laser treatments.',
      doctorCount: 2
    },
    {
      id: 'dept-dental',
      name: 'Dental Care',
      icon: 'fa-tooth',
      description: 'Oral hygiene, root canals, orthodontics, and restorative dentistry.',
      doctorCount: 3
    }
  ];

  const DOCTORS = [
    {
      id: 'doc-1',
      name: 'Dr. Elena Vance, MD',
      deptId: 'dept-cardiology',
      deptName: 'Cardiology',
      title: 'Senior Interventional Cardiologist',
      experience: '14 years exp',
      rating: 4.9,
      reviews: 142,
      fee: 120,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
      room: 'Building B, Room 204',
      availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    {
      id: 'doc-2',
      name: 'Dr. Marcus Brody, FACC',
      deptId: 'dept-cardiology',
      deptName: 'Cardiology',
      title: 'Consultant Cardiologist & Electrophysiologist',
      experience: '18 years exp',
      rating: 4.8,
      reviews: 98,
      fee: 140,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
      room: 'Building B, Room 208',
      availabilityDays: ['Mon', 'Wed', 'Fri']
    },
    {
      id: 'doc-3',
      name: 'Dr. Sophia Lin, PhD',
      deptId: 'dept-neurology',
      deptName: 'Neurology',
      title: 'Head of Neuro-Science Division',
      experience: '12 years exp',
      rating: 4.95,
      reviews: 210,
      fee: 150,
      avatar: 'https://images.unsplash.com/photo-1594824813566-78a93272d346?auto=format&fit=crop&w=200&q=80',
      room: 'Main Tower, Room 410',
      availabilityDays: ['Tue', 'Thu', 'Sat']
    },
    {
      id: 'doc-4',
      name: 'Dr. David Miller, FAAP',
      deptId: 'dept-pediatrics',
      deptName: 'Pediatrics',
      title: 'Pediatric Specialist & Child Specialist',
      experience: '10 years exp',
      rating: 4.9,
      reviews: 185,
      fee: 90,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
      room: 'Pediatric Wing, Room 102',
      availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    {
      id: 'doc-5',
      name: 'Dr. Rachel Adams, MS',
      deptId: 'dept-orthopedics',
      deptName: 'Orthopedics',
      title: 'Orthopedic Surgeon & Joint Replacement Specialist',
      experience: '16 years exp',
      rating: 4.85,
      reviews: 115,
      fee: 130,
      avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=200&q=80',
      room: 'Surgical Block, Room 301',
      availabilityDays: ['Mon', 'Wed', 'Thu']
    },
    {
      id: 'doc-6',
      name: 'Dr. Jonathan Sterling, MD',
      deptId: 'dept-dermatology',
      deptName: 'Dermatology',
      title: 'Cosmetic & Medical Dermatologist',
      experience: '11 years exp',
      rating: 4.75,
      reviews: 89,
      fee: 110,
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
      room: 'Clinic A, Room 105',
      availabilityDays: ['Mon', 'Tue', 'Thu', 'Fri']
    },
    {
      id: 'doc-7',
      name: 'Dr. Sarah Jenkins, MD',
      deptId: 'dept-general',
      deptName: 'General Medicine',
      title: 'Primary Care Physician',
      experience: '8 years exp',
      rating: 4.88,
      reviews: 175,
      fee: 80,
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=200&q=80',
      room: 'OPD Hall, Desk 4',
      availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    {
      id: 'doc-8',
      name: 'Dr. Robert Chen, OD',
      deptId: 'dept-ophthalmology',
      deptName: 'Ophthalmology',
      title: 'Eye Specialist & Cataract Surgeon',
      experience: '15 years exp',
      rating: 4.92,
      reviews: 130,
      fee: 100,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
      room: 'Vision Center, Suite 12',
      availabilityDays: ['Mon', 'Wed', 'Fri', 'Sat']
    }
  ];

  // Initial Seed Appointments for demonstration
  const INITIAL_APPOINTMENTS = [
    {
      refId: 'MCD-2026-8492',
      patientName: 'Sarah Jenkins',
      patientEmail: 'sarah.j@example.com',
      patientPhone: '+1 (555) 234-5678',
      patientAge: 29,
      patientGender: 'Female',
      drId: 'doc-1',
      drName: 'Dr. Elena Vance, MD',
      deptName: 'Cardiology',
      drAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
      date: getOffsetDateString(1),
      timeSlot: '10:30 AM',
      mode: 'In-Person Hospital Visit',
      room: 'Building B, Room 204',
      fee: '$120.00',
      status: 'Confirmed',
      notes: 'Routine heart checkup and blood pressure consultation.',
      createdDate: new Date().toISOString()
    },
    {
      refId: 'MCD-2026-4109',
      patientName: 'Michael Chang',
      patientEmail: 'mchang@example.com',
      patientPhone: '+1 (555) 876-5432',
      patientAge: 45,
      patientGender: 'Male',
      drId: 'doc-3',
      drName: 'Dr. Sophia Lin, PhD',
      deptName: 'Neurology',
      drAvatar: 'https://images.unsplash.com/photo-1594824813566-78a93272d346?auto=format&fit=crop&w=200&q=80',
      date: getOffsetDateString(2),
      timeSlot: '02:00 PM',
      mode: 'Virtual Teleconsultation',
      room: 'Virtual HD Video Link',
      fee: '$150.00',
      status: 'Confirmed',
      notes: 'Follow-up consultation regarding recurring migraines.',
      createdDate: new Date().toISOString()
    },
    {
      refId: 'MCD-2026-1154',
      patientName: 'Emma Watson',
      patientEmail: 'emma.w@example.com',
      patientPhone: '+1 (555) 345-6789',
      patientAge: 8,
      patientGender: 'Female',
      drId: 'doc-4',
      drName: 'Dr. David Miller, FAAP',
      deptName: 'Pediatrics',
      drAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
      date: getOffsetDateString(-1),
      timeSlot: '11:15 AM',
      mode: 'In-Person Hospital Visit',
      room: 'Pediatric Wing, Room 102',
      fee: '$90.00',
      status: 'Completed',
      notes: 'Annual child immunization and growth checkup.',
      createdDate: new Date().toISOString()
    }
  ];

  // Helper date function for generating ISO date strings relative to today
  function getOffsetDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  }

  // ==========================================
  // 2. STATE MANAGEMENT & STORAGE
  // ==========================================

  let state = {
    appointments: JSON.parse(localStorage.getItem('mcd_appointments')) || INITIAL_APPOINTMENTS,
    theme: localStorage.getItem('mcd_theme') || 'light',
    activeView: 'home-view',
    
    // Booking Wizard State
    bookingStep: 1,
    selectedDept: null,
    selectedDoctor: null,
    selectedDate: getOffsetDateString(1),
    selectedTimeSlot: null,
    patientForm: {}
  };

  function saveAppointmentsToStorage() {
    localStorage.setItem('mcd_appointments', JSON.stringify(state.appointments));
  }

  // ==========================================
  // 3. UI RENDERERS & CONTROLLERS
  // ==========================================

  // --- View Switcher ---
  function switchView(viewId) {
    state.activeView = viewId;
    
    // Update nav button active states
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.target === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle view visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      if (sec.id === viewId) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // View specific refresh actions
    if (viewId === 'patient-portal-view') {
      renderPatientAppointments();
    } else if (viewId === 'admin-view') {
      renderAdminDashboard();
    } else if (viewId === 'booking-view') {
      renderWizardStep(state.bookingStep);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Theme Controller ---
  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('mcd_theme', state.theme);
    
    const icon = document.querySelector('#theme-toggle i');
    if (state.theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  }

  // --- Home Landing Renderer ---
  function renderHomeLanding() {
    const grid = document.getElementById('departments-landing-grid');
    grid.innerHTML = DEPARTMENTS.map(dept => `
      <div class="dept-card" data-dept-id="${dept.id}">
        <div class="dept-icon-wrapper">
          <i class="fa-solid ${dept.icon}"></i>
        </div>
        <h3>${dept.name}</h3>
        <p>${dept.description}</p>
        <div class="dept-footer">
          <span>${dept.doctorCount} Specialists Available</span>
          <i class="fa-solid fa-chevron-right"></i>
        </div>
      </div>
    `).join('');

    // Attach click events on landing department cards
    grid.querySelectorAll('.dept-card').forEach(card => {
      card.addEventListener('click', () => {
        const deptId = card.dataset.deptId;
        const dept = DEPARTMENTS.find(d => d.id === deptId);
        selectDepartment(dept);
        switchView('booking-view');
        goToWizardStep(2);
      });
    });
  }

  // --- Booking Wizard Engine ---
  function goToWizardStep(stepNum) {
    state.bookingStep = stepNum;
    
    // Update Stepper Visuals
    document.querySelectorAll('.step-item').forEach(item => {
      const step = parseInt(item.dataset.step);
      if (step === stepNum) {
        item.classList.add('active');
        item.classList.remove('completed');
      } else if (step < stepNum) {
        item.classList.remove('active');
        item.classList.add('completed');
      } else {
        item.classList.remove('active', 'completed');
      }
    });

    // Hide all steps, show active
    document.querySelectorAll('.wizard-step-content').forEach(content => {
      content.classList.remove('active');
    });

    const activeContent = document.getElementById(`wizard-step-${stepNum}`);
    if (activeContent) activeContent.classList.add('active');

    renderWizardStep(stepNum);
  }

  function renderWizardStep(stepNum) {
    if (stepNum === 1) {
      renderWizardStep1();
    } else if (stepNum === 2) {
      renderWizardStep2();
    } else if (stepNum === 3) {
      renderWizardStep3();
    }
  }

  // Wizard Step 1: Department Selection
  function renderWizardStep1() {
    const list = document.getElementById('department-wizard-list');
    list.innerHTML = DEPARTMENTS.map(dept => `
      <div class="dept-select-card ${state.selectedDept?.id === dept.id ? 'selected' : ''}" data-dept-id="${dept.id}">
        <div class="dept-icon-wrapper">
          <i class="fa-solid ${dept.icon}"></i>
        </div>
        <div>
          <h4>${dept.name}</h4>
          <span class="text-muted" style="font-size: 12px;">${dept.doctorCount} Doctors</span>
        </div>
      </div>
    `).join('');

    const nextBtn = document.getElementById('step1-next-btn');
    nextBtn.disabled = !state.selectedDept;

    list.querySelectorAll('.dept-select-card').forEach(card => {
      card.addEventListener('click', () => {
        const dept = DEPARTMENTS.find(d => d.id === card.dataset.deptId);
        selectDepartment(dept);
        renderWizardStep1();
      });
    });
  }

  function selectDepartment(dept) {
    state.selectedDept = dept;
    state.selectedDoctor = null; // reset dr selection
  }

  // Wizard Step 2: Doctor Selection
  function renderWizardStep2() {
    const deptTag = document.getElementById('selected-dept-tag');
    if (state.selectedDept) {
      deptTag.textContent = `Department: ${state.selectedDept.name}`;
    }

    const list = document.getElementById('doctor-wizard-list');
    const filteredDoctors = state.selectedDept
      ? DOCTORS.filter(doc => doc.deptId === state.selectedDept.id)
      : DOCTORS;

    if (filteredDoctors.length === 0) {
      list.innerHTML = `<div class="empty-msg"><p>No doctors currently listed for this specialty.</p></div>`;
      return;
    }

    list.innerHTML = filteredDoctors.map(doc => `
      <div class="doctor-card ${state.selectedDoctor?.id === doc.id ? 'selected' : ''}" data-doc-id="${doc.id}">
        <div class="doc-info-row">
          <img src="${doc.avatar}" alt="${doc.name}" class="avatar-md">
          <div class="doc-meta">
            <h4>${doc.name}</h4>
            <span class="spec">${doc.title}</span>
            <span class="exp">${doc.experience}</span>
            <div class="doc-ratings">
              <i class="fa-solid fa-star"></i> ${doc.rating} (${doc.reviews} reviews)
            </div>
          </div>
        </div>
        <div class="doc-details-row">
          <span>Fee: <strong class="fee-tag">$${doc.fee}</strong></span>
          <span class="badge badge-info"><i class="fa-solid fa-building"></i> ${doc.room}</span>
        </div>
      </div>
    `).join('');

    const nextBtn = document.getElementById('step2-next-btn');
    nextBtn.disabled = !state.selectedDoctor;

    list.querySelectorAll('.doctor-card').forEach(card => {
      card.addEventListener('click', () => {
        state.selectedDoctor = DOCTORS.find(d => d.id === card.dataset.doc-id);
        renderWizardStep2();
      });
    });
  }

  // Wizard Step 3: Date & Time Picker
  function renderWizardStep3() {
    const dateInput = document.getElementById('appointment-date');
    dateInput.min = getOffsetDateString(0);
    dateInput.value = state.selectedDate;

    // Dr Brief
    const drBrief = document.getElementById('selected-dr-brief');
    if (state.selectedDoctor) {
      drBrief.innerHTML = `
        <img src="${state.selectedDoctor.avatar}" class="avatar-sm">
        <div>
          <h4>${state.selectedDoctor.name}</h4>
          <p style="font-size:12px; color:var(--text-muted);">${state.selectedDoctor.deptName} • $${state.selectedDoctor.fee}</p>
        </div>
      `;
    }

    renderTimeSlots();
  }

  function renderTimeSlots() {
    const morningGrid = document.getElementById('morning-slots');
    const afternoonGrid = document.getElementById('afternoon-slots');
    const eveningGrid = document.getElementById('evening-slots');

    const morningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:15 AM', '11:45 AM'];
    const afternoonSlots = ['01:30 PM', '02:00 PM', '02:30 PM', '03:15 PM', '04:00 PM'];
    const eveningSlots = ['05:00 PM', '05:30 PM', '06:15 PM', '07:00 PM'];

    // Check existing appointments on selected date & doctor to mark booked slots
    const bookedSlotsForDr = state.appointments
      .filter(app => app.drId === state.selectedDoctor?.id && app.date === state.selectedDate && app.status !== 'Cancelled')
      .map(app => app.timeSlot);

    function createSlotButtons(slotsArr) {
      return slotsArr.map(slot => {
        const isBooked = bookedSlotsForDr.includes(slot);
        const isSelected = state.selectedTimeSlot === slot;
        return `
          <button class="time-slot-btn ${isSelected ? 'selected' : ''}" 
                  ${isBooked ? 'disabled' : ''} 
                  data-slot="${slot}">
            ${slot}
          </button>
        `;
      }).join('');
    }

    morningGrid.innerHTML = createSlotButtons(morningSlots);
    afternoonGrid.innerHTML = createSlotButtons(afternoonSlots);
    eveningGrid.innerHTML = createSlotButtons(eveningSlots);

    const nextBtn = document.getElementById('step3-next-btn');
    nextBtn.disabled = !state.selectedTimeSlot;

    // Attach click events
    document.querySelectorAll('.time-slot-btn:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        state.selectedTimeSlot = btn.dataset.slot;
        renderTimeSlots();
      });
    });
  }

  // --- Final Booking Confirmation Engine ---
  function processBookingConfirmation() {
    const form = document.getElementById('booking-patient-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const patientName = document.getElementById('patient-name').value;
    const patientEmail = document.getElementById('patient-email').value;
    const patientPhone = document.getElementById('patient-phone').value;
    const patientAge = document.getElementById('patient-age').value;
    const patientGender = document.getElementById('patient-gender').value;
    const consultType = document.getElementById('consult-type').value;
    const notes = document.getElementById('patient-notes').value;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const refId = `MCD-2026-${randomNum}`;

    const newAppointment = {
      refId: refId,
      patientName: patientName,
      patientEmail: patientEmail,
      patientPhone: patientPhone,
      patientAge: patientAge,
      patientGender: patientGender,
      drId: state.selectedDoctor.id,
      drName: state.selectedDoctor.name,
      deptName: state.selectedDoctor.deptName,
      drAvatar: state.selectedDoctor.avatar,
      date: state.selectedDate,
      timeSlot: state.selectedTimeSlot,
      mode: consultType,
      room: state.selectedDoctor.room,
      fee: `$${state.selectedDoctor.fee}.00`,
      status: 'Confirmed',
      notes: notes || 'General Consultation',
      createdDate: new Date().toISOString()
    };

    // Save to state & storage
    state.appointments.unshift(newAppointment);
    saveAppointmentsToStorage();

    // Render Digital Pass / Ticket View
    renderTicketView(newAppointment);
    showToast(`Appointment ${refId} successfully confirmed!`, 'success');
    switchView('ticket-view');
  }

  function renderTicketView(app) {
    document.getElementById('ticket-ref-id').textContent = app.refId;
    document.getElementById('ticket-dr-img').src = app.drAvatar;
    document.getElementById('ticket-dr-name').textContent = app.drName;
    document.getElementById('ticket-dr-dept').textContent = app.deptName;
    document.getElementById('ticket-patient-name').textContent = app.patientName;
    document.getElementById('ticket-datetime').textContent = `${app.date} @ ${app.timeSlot}`;
    document.getElementById('ticket-mode').textContent = app.mode;
    document.getElementById('ticket-room').textContent = app.room;
    document.getElementById('ticket-fee').textContent = app.fee;
    
    const statusBadge = document.getElementById('ticket-status');
    statusBadge.textContent = app.status;
    statusBadge.className = `badge badge-${app.status === 'Confirmed' ? 'success' : 'warning'}`;
  }

  // --- Patient Portal Renderer ---
  function renderPatientAppointments(filterStatus = 'all', searchQuery = '') {
    const container = document.getElementById('patient-appointments-container');
    let apps = state.appointments;

    if (filterStatus !== 'all') {
      apps = apps.filter(a => a.status === filterStatus);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      apps = apps.filter(a => a.drName.toLowerCase().includes(q) || a.refId.toLowerCase().includes(q) || a.deptName.toLowerCase().includes(q));
    }

    if (apps.length === 0) {
      container.innerHTML = `
        <div class="glass-panel" style="grid-column: 1/-1; padding: 48px; text-align: center;">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
          <h3>No Appointments Found</h3>
          <p style="color: var(--text-muted); margin-bottom: 20px;">You have no scheduled appointments matching your criteria.</p>
          <button class="btn btn-primary action-book-now"><i class="fa-solid fa-plus"></i> Schedule New Appointment</button>
        </div>
      `;
      return;
    }

    container.innerHTML = apps.map(app => `
      <div class="appointment-card glass-panel">
        <div class="app-card-header">
          <span class="app-ref-badge">${app.refId}</span>
          <span class="badge badge-${getBadgeClass(app.status)}">${app.status}</span>
        </div>

        <div class="app-card-body">
          <div class="app-dr-info">
            <img src="${app.drAvatar}" class="avatar-sm">
            <div>
              <h4 style="font-size: 15px;">${app.drName}</h4>
              <p style="font-size: 12px; color: var(--text-muted);">${app.deptName}</p>
            </div>
          </div>
          
          <div style="font-size: 13px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px; margin-top: 8px;">
            <span><i class="fa-regular fa-calendar" style="color: var(--primary);"></i> <strong>${app.date}</strong> at <strong>${app.timeSlot}</strong></span>
            <span><i class="fa-solid fa-location-dot" style="color: var(--secondary);"></i> ${app.mode} (${app.room})</span>
          </div>
        </div>

        <div class="app-card-footer">
          ${app.status === 'Confirmed' ? `
            <button class="btn btn-sm btn-secondary cancel-app-btn" data-ref="${app.refId}"><i class="fa-solid fa-xmark"></i> Cancel</button>
            <button class="btn btn-sm btn-outline reschedule-app-btn" data-ref="${app.refId}"><i class="fa-solid fa-clock-rotate-left"></i> Reschedule</button>
          ` : `
            <span style="font-size: 12px; color: var(--text-muted);">Consultation Completed</span>
          `}
          <button class="btn btn-sm btn-primary view-ticket-btn" data-ref="${app.refId}"><i class="fa-solid fa-receipt"></i> Pass</button>
        </div>
      </div>
    `).join('');

    // Attach card action handlers
    container.querySelectorAll('.cancel-app-btn').forEach(btn => {
      btn.addEventListener('click', () => cancelAppointment(btn.dataset.ref));
    });

    container.querySelectorAll('.view-ticket-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const app = state.appointments.find(a => a.refId === btn.dataset.ref);
        if (app) {
          renderTicketView(app);
          switchView('ticket-view');
        }
      });
    });

    container.querySelectorAll('.reschedule-app-btn').forEach(btn => {
      btn.addEventListener('click', () => openRescheduleModal(btn.dataset.ref));
    });
  }

  function getBadgeClass(status) {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Completed': return 'info';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  }

  function cancelAppointment(refId) {
    if (confirm(`Are you sure you want to cancel appointment ${refId}?`)) {
      const app = state.appointments.find(a => a.refId === refId);
      if (app) {
        app.status = 'Cancelled';
        saveAppointmentsToStorage();
        renderPatientAppointments();
        renderAdminDashboard();
        showToast(`Appointment ${refId} has been cancelled.`, 'warning');
      }
    }
  }

  // --- Admin Dashboard Controller ---
  function renderAdminDashboard() {
    const apps = state.appointments;

    // Recalculate KPIs
    document.getElementById('kpi-total-app').textContent = apps.length;
    document.getElementById('kpi-confirmed-today').textContent = apps.filter(a => a.status === 'Confirmed').length;
    document.getElementById('kpi-pending-app').textContent = apps.filter(a => a.status === 'Pending').length;
    document.getElementById('kpi-active-docs').textContent = DOCTORS.length;

    const tbody = document.getElementById('admin-appointments-tbody');
    const filter = document.getElementById('admin-status-filter').value;

    let filtered = apps;
    if (filter !== 'all') {
      filtered = apps.filter(a => a.status === filter);
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No logs matching selected status.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(app => `
      <tr>
        <td><strong>${app.refId}</strong></td>
        <td>
          <div>${app.patientName}</div>
          <small style="color: var(--text-muted);">${app.patientPhone}</small>
        </td>
        <td>
          <div>${app.drName}</div>
          <small style="color: var(--text-muted);">${app.deptName}</small>
        </td>
        <td>${app.date}<br><small>${app.timeSlot}</small></td>
        <td><span class="badge badge-info">${app.mode}</span></td>
        <td><span class="badge badge-${getBadgeClass(app.status)}">${app.status}</span></td>
        <td>
          <div class="table-actions-cell">
            ${app.status === 'Confirmed' ? `
              <button class="btn btn-sm btn-success mark-completed-btn" data-ref="${app.refId}"><i class="fa-solid fa-check"></i> Complete</button>
              <button class="btn btn-sm btn-danger admin-cancel-btn" data-ref="${app.refId}"><i class="fa-solid fa-xmark"></i></button>
            ` : `
              <span style="font-size: 12px; color: var(--text-muted);">-</span>
            `}
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.mark-completed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const app = state.appointments.find(a => a.refId === btn.dataset.ref);
        if (app) {
          app.status = 'Completed';
          saveAppointmentsToStorage();
          renderAdminDashboard();
          showToast(`Appointment ${app.refId} marked as Completed.`, 'success');
        }
      });
    });

    tbody.querySelectorAll('.admin-cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => cancelAppointment(btn.dataset.ref));
    });
  }

  // --- AI Symptom Triage Assistant ---
  function runAISymptomTriage(inputSymptom) {
    const text = inputSymptom.toLowerCase();
    const resultCard = document.getElementById('ai-analysis-output');
    resultCard.classList.remove('hidden');

    let recommendedDept = DEPARTMENTS[5]; // Default General Medicine
    let urgency = 'Low / Routine';
    let reasoning = 'Based on your symptoms, a primary healthcare consultation with General Medicine is advised.';

    if (text.includes('chest') || text.includes('heart') || text.includes('palpitation') || text.includes('pressure')) {
      recommendedDept = DEPARTMENTS[0]; // Cardiology
      urgency = 'Moderate to Urgent';
      reasoning = 'Chest pressure or cardiac symptoms require evaluation by a Senior Cardiologist.';
    } else if (text.includes('headache') || text.includes('brain') || text.includes('dizziness') || text.includes('migraine')) {
      recommendedDept = DEPARTMENTS[1]; // Neurology
      urgency = 'Moderate';
      reasoning = 'Neurological symptoms like severe headaches or dizziness warrant a specialist examination.';
    } else if (text.includes('child') || text.includes('infant') || text.includes('baby') || text.includes('kid')) {
      recommendedDept = DEPARTMENTS[2]; // Pediatrics
      urgency = 'Standard Pediatric';
      reasoning = 'Child health concerns should be evaluated by a certified Pediatrician.';
    } else if (text.includes('bone') || text.includes('joint') || text.includes('fracture') || text.includes('knee') || text.includes('back pain')) {
      recommendedDept = DEPARTMENTS[3]; // Orthopedics
      urgency = 'Moderate';
      reasoning = 'Musculoskeletal pain and joint stiffness are best managed by Orthopedics.';
    } else if (text.includes('skin') || text.includes('rash') || text.includes('itch') || text.includes('acne')) {
      recommendedDept = DEPARTMENTS[4]; // Dermatology
      urgency = 'Low / Routine';
      reasoning = 'Skin irritations and dermatological symptoms match our Dermatology department.';
    } else if (text.includes('eye') || text.includes('vision') || text.includes('blur')) {
      recommendedDept = DEPARTMENTS[6]; // Ophthalmology
      urgency = 'Routine Vision Check';
      reasoning = 'Vision changes and eye discomfort require an ophthalmology consultation.';
    } else if (text.includes('tooth') || text.includes('teeth') || text.includes('dental') || text.includes('gum')) {
      recommendedDept = DEPARTMENTS[7]; // Dental
      urgency = 'Routine Dental';
      reasoning = 'Oral discomfort or dental symptoms match our Dental Care center.';
    }

    const topDoc = DOCTORS.find(d => d.deptId === recommendedDept.id) || DOCTORS[0];

    resultCard.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom: 8px;">
        <i class="fa-solid fa-circle-nodes" style="font-size:20px; color:var(--primary);"></i>
        <h4 style="font-size:16px;">Triage Recommendation</h4>
      </div>
      <p style="font-size:13px; margin-bottom: 12px; color:var(--text-primary);">${reasoning}</p>
      
      <div style="background:var(--bg-surface); padding:12px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted);">Recommended Dept</span>
          <h5 style="font-size:15px; color:var(--primary);">${recommendedDept.name}</h5>
        </div>
        <button class="btn btn-sm btn-primary ai-book-dept-btn" data-dept-id="${recommendedDept.id}">
          Book ${recommendedDept.name}
        </button>
      </div>
    `;

    resultCard.querySelector('.ai-book-dept-btn').addEventListener('click', () => {
      document.getElementById('ai-modal').classList.remove('active');
      selectDepartment(recommendedDept);
      switchView('booking-view');
      goToWizardStep(2);
    });
  }

  // --- Reschedule Modal Handler ---
  function openRescheduleModal(refId) {
    const modal = document.getElementById('reschedule-modal');
    document.getElementById('reschedule-app-id').value = refId;
    const dateInput = document.getElementById('reschedule-date');
    dateInput.value = getOffsetDateString(1);
    dateInput.min = getOffsetDateString(0);

    const slotsGrid = document.getElementById('reschedule-slots');
    const slots = ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'];
    slotsGrid.innerHTML = slots.map(s => `
      <button class="time-slot-btn" data-slot="${s}">${s}</button>
    `).join('');

    let selectedSlot = slots[0];
    slotsGrid.querySelectorAll('.time-slot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        slotsGrid.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSlot = btn.dataset.slot;
      });
    });

    modal.classList.add('active');

    document.getElementById('save-reschedule-btn').onclick = () => {
      const app = state.appointments.find(a => a.refId === refId);
      if (app) {
        app.date = dateInput.value;
        app.timeSlot = selectedSlot;
        app.status = 'Confirmed';
        saveAppointmentsToStorage();
        modal.classList.remove('active');
        renderPatientAppointments();
        renderAdminDashboard();
        showToast(`Appointment ${refId} rescheduled to ${app.date} @ ${app.timeSlot}`, 'success');
      }
    };
  }

  // --- Toast System ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  // --- Live Clock ---
  function initLiveClock() {
    const clockEl = document.getElementById('live-time-display');
    if (!clockEl) return;
    setInterval(() => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString();
    }, 1000);
  }

  // --- Global Autocomplete Search ---
  function initGlobalSearch() {
    const input = document.getElementById('global-search-input');
    const dropdown = document.getElementById('search-results-dropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (q.length < 2) {
        dropdown.classList.add('hidden');
        return;
      }

      const matchedDocs = DOCTORS.filter(d => d.name.toLowerCase().includes(q) || d.deptName.toLowerCase().includes(q));
      const matchedDepts = DEPARTMENTS.filter(d => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));

      if (matchedDocs.length === 0 && matchedDepts.length === 0) {
        dropdown.innerHTML = `<div class="search-result-item"><span>No matching doctors or departments</span></div>`;
      } else {
        dropdown.innerHTML = [
          ...matchedDepts.map(dept => `
            <div class="search-result-item" data-type="dept" data-id="${dept.id}">
              <div>
                <strong><i class="fa-solid ${dept.icon}"></i> ${dept.name}</strong>
                <div style="font-size:12px; color:var(--text-muted);">Medical Specialty</div>
              </div>
              <button class="btn btn-sm btn-outline">Select</button>
            </div>
          `),
          ...matchedDocs.map(doc => `
            <div class="search-result-item" data-type="doc" data-id="${doc.id}">
              <div>
                <strong><i class="fa-solid fa-user-doctor"></i> ${doc.name}</strong>
                <div style="font-size:12px; color:var(--text-muted);">${doc.deptName} • ${doc.experience}</div>
              </div>
              <button class="btn btn-sm btn-primary">Book Dr</button>
            </div>
          `)
        ].join('');
      }

      dropdown.classList.remove('hidden');

      dropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const type = item.dataset.type;
          const id = item.dataset.id;
          dropdown.classList.add('hidden');
          input.value = '';

          if (type === 'dept') {
            const dept = DEPARTMENTS.find(d => d.id === id);
            selectDepartment(dept);
            switchView('booking-view');
            goToWizardStep(2);
          } else if (type === 'doc') {
            const doc = DOCTORS.find(d => d.id === id);
            const dept = DEPARTMENTS.find(d => d.id === doc.deptId);
            selectDepartment(dept);
            state.selectedDoctor = doc;
            switchView('booking-view');
            goToWizardStep(3);
          }
        });
      });
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // ==========================================
  // 4. EVENT LISTENERS INITIALIZATION
  // ==========================================

  function initEventListeners() {
    // Navigation link clicks
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.dataset.target;
        if (target) switchView(target);
      });
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Book Now Action Buttons
    document.querySelectorAll('.action-book-now').forEach(btn => {
      btn.addEventListener('click', () => {
        switchView('booking-view');
        goToWizardStep(1);
      });
    });

    // Wizard Next/Prev Buttons
    document.getElementById('step1-next-btn').addEventListener('click', () => goToWizardStep(2));
    document.getElementById('step2-prev-btn').addEventListener('click', () => goToWizardStep(1));
    document.getElementById('step2-next-btn').addEventListener('click', () => goToWizardStep(3));
    document.getElementById('step3-prev-btn').addEventListener('click', () => goToWizardStep(2));
    document.getElementById('step3-next-btn').addEventListener('click', () => goToWizardStep(4));
    document.getElementById('step4-prev-btn').addEventListener('click', () => goToWizardStep(3));

    // Confirm Booking Button
    document.getElementById('confirm-booking-btn').addEventListener('click', (e) => {
      e.preventDefault();
      processBookingConfirmation();
    });

    // Date change listener in Wizard Step 3
    document.getElementById('appointment-date').addEventListener('change', (e) => {
      state.selectedDate = e.target.value;
      state.selectedTimeSlot = null;
      renderTimeSlots();
    });

    // Ticket Actions
    document.getElementById('print-ticket-btn').addEventListener('click', () => window.print());
    document.getElementById('view-my-appointments-btn').addEventListener('click', () => switchView('patient-portal-view'));
    document.getElementById('book-another-btn').addEventListener('click', () => {
      state.selectedDept = null;
      state.selectedDoctor = null;
      state.selectedTimeSlot = null;
      switchView('booking-view');
      goToWizardStep(1);
    });

    // Patient Portal Filter Tabs
    document.querySelectorAll('#patient-filter-tabs .tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#patient-filter-tabs .tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderPatientAppointments(tab.dataset.filter, document.getElementById('patient-app-search').value);
      });
    });

    document.getElementById('patient-app-search').addEventListener('input', (e) => {
      const activeTab = document.querySelector('#patient-filter-tabs .tab-btn.active');
      renderPatientAppointments(activeTab ? activeTab.dataset.filter : 'all', e.target.value);
    });

    // Admin Filter
    document.getElementById('admin-status-filter').addEventListener('change', renderAdminDashboard);
    document.getElementById('seed-data-btn').addEventListener('click', () => {
      if (confirm('Reset appointments database to default demo records?')) {
        state.appointments = [...INITIAL_APPOINTMENTS];
        saveAppointmentsToStorage();
        renderAdminDashboard();
        showToast('Demo dataset re-seeded successfully.', 'info');
      }
    });

    // AI Symptom Modal Triggers
    const aiModal = document.getElementById('ai-modal');
    const openAIModal = () => aiModal.classList.add('active');
    const closeAIModal = () => aiModal.classList.remove('active');

    document.getElementById('ai-symptom-btn').addEventListener('click', openAIModal);
    document.getElementById('hero-ai-btn').addEventListener('click', openAIModal);
    document.getElementById('close-ai-modal').addEventListener('click', closeAIModal);
    document.getElementById('ai-modal-cancel').addEventListener('click', closeAIModal);

    document.getElementById('run-ai-triage-btn').addEventListener('click', () => {
      const input = document.getElementById('ai-symptom-input').value;
      if (!input.trim()) {
        showToast('Please enter your symptoms before analyzing.', 'warning');
        return;
      }
      runAISymptomTriage(input);
    });

    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('ai-symptom-input').value = chip.dataset.symptom;
        runAISymptomTriage(chip.dataset.symptom);
      });
    });

    // Reschedule modal cancel
    document.getElementById('close-reschedule-modal').onclick = () => document.getElementById('reschedule-modal').classList.remove('active');
    document.getElementById('cancel-reschedule-btn').onclick = () => document.getElementById('reschedule-modal').classList.remove('active');

    // Quick Book Hero Dr
    document.querySelector('.quick-book-dr')?.addEventListener('click', () => {
      state.selectedDoctor = DOCTORS[0];
      state.selectedDept = DEPARTMENTS[0];
      switchView('booking-view');
      goToWizardStep(3);
    });
  }

  // --- Application Bootstrap ---
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.setAttribute('data-theme', state.theme);
    renderHomeLanding();
    initEventListeners();
    initLiveClock();
    initGlobalSearch();
    renderPatientAppointments();
    renderAdminDashboard();
  });

})();
