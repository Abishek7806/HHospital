-- Sample Initial Data for Hospital Appointment System

-- Users (Admin Credentials: abikrish@gmail.com / Abishek@2006)
INSERT INTO users (id, full_name, email, password, role, phone, avatar_url) VALUES
(1, 'Abishek (Admin)', 'abikrish@gmail.com', 'Abishek@2006', 'admin', '+1 (555) 019-2831', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 'Dr. Sarah Jenkins', 'sarah.jenkins@hospital.com', 'demo123', 'doctor', '+1 (555) 234-5678', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'),
(3, 'Dr. Marcus Vance', 'marcus.vance@hospital.com', 'demo123', 'doctor', '+1 (555) 345-6789', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'),
(4, 'Dr. Elena Rostova', 'elena.rostova@hospital.com', 'demo123', 'doctor', '+1 (555) 456-7890', 'https://images.unsplash.com/photo-1594824813566-88855ce78905?w=150'),
(5, 'Dr. David Kim', 'david.kim@hospital.com', 'demo123', 'doctor', '+1 (555) 567-8901', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150'),
(6, 'John Doe', 'john.doe@gmail.com', 'demo123', 'patient', '+1 (555) 987-6543', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(7, 'Emily Watson', 'emily.watson@gmail.com', 'demo123', 'patient', '+1 (555) 876-5432', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');

-- Doctors
INSERT INTO doctors (id, user_id, specialization, qualification, experience_years, consultation_fee, room_number, rating, bio) VALUES
(1, 2, 'Cardiology', 'MD, FACC - Harvard Medical', 14, 120.00, 'Suite 302', 4.9, 'Board-certified cardiologist specializing in preventive heart health, coronary artery disease, and hypertension management.'),
(2, 3, 'Neurology', 'MD, PhD - Johns Hopkins', 11, 140.00, 'Suite 405', 4.8, 'Expert in migraine disorders, neuro-inflammatory conditions, epilepsy, and cognitive neurological health.'),
(3, 4, 'Dermatology', 'MD - Stanford Health', 8, 95.00, 'Suite 108', 4.9, 'Specializes in cosmetic and surgical dermatology, eczema, acne therapies, and skin cancer screening.'),
(4, 5, 'Pediatrics', 'MD - Columbia University', 9, 85.00, 'Suite 201', 4.7, 'Compassionate pediatrician focused on child development, vaccinations, pediatric nutrition, and general care.');

-- Patients
INSERT INTO patients (id, user_id, dob, gender, blood_group, emergency_contact, address, medical_history_summary) VALUES
(1, 6, '1988-04-12', 'Male', 'O+', '+1 (555) 911-0022', '742 Evergreen Terrace, Springfield', 'Mild seasonal asthma, hypertension controlled with diet.'),
(2, 7, '1994-09-25', 'Female', 'A+', '+1 (555) 911-0033', '104 Lincoln Blvd, Chicago, IL', 'No major prior surgeries. Known penicillin allergy.');

-- Schedules
INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_mins) VALUES
(1, 'Monday', '09:00:00', '17:00:00', 30),
(1, 'Wednesday', '09:00:00', '17:00:00', 30),
(1, 'Friday', '09:00:00', '14:00:00', 30),
(2, 'Tuesday', '10:00:00', '18:00:00', 30),
(2, 'Thursday', '10:00:00', '18:00:00', 30),
(3, 'Monday', '08:30:00', '15:30:00', 30),
(3, 'Thursday', '08:30:00', '15:30:00', 30),
(4, 'Tuesday', '09:00:00', '16:00:00', 30),
(4, 'Friday', '09:00:00', '16:00:00', 30);

-- Appointments
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, symptoms, consultation_fee, payment_status) VALUES
(1, 1, 1, '2026-08-28', '10:00 AM', 'confirmed', 'Annual Cardiac Checkup', 'Occasional palpitations after heavy exertion.', 120.00, 'paid'),
(2, 1, 3, '2026-08-20', '02:30 PM', 'completed', 'Skin Rash Consultation', 'Dry itching patch on left forearm for 2 weeks.', 95.00, 'paid'),
(3, 2, 2, '2026-08-30', '11:30 AM', 'pending', 'Frequent Migraines', 'Throbbing headache twice a week sensitive to light.', 140.00, 'paid');

-- Medical Records
INSERT INTO medical_records (id, appointment_id, patient_id, doctor_id, diagnosis, prescription, lab_tests, doctor_notes) VALUES
(1, 2, 1, 3, 'Contact Dermatitis (Mild Eczema Flare-up)', 'Hydrocortisone 1% Cream (Apply twice daily for 7 days)\nCetirizine 10mg (1 tablet daily at bedtime)', 'Skin Patch Allergy Test recommended if rash recurs', 'Patient responded well to topical treatment during follow-up call. Advised to avoid harsh soaps.');
