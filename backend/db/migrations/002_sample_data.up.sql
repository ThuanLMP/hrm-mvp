-- Insert sample users
INSERT INTO users (email, password_hash, role) VALUES
('admin@company.com', '$2b$10$rQj.8b8QZ8pK5gKkK5bKQu1V9GqK5gKkK5bKQu1V9GqK5gKkK5bK', 'admin'),
('director@company.com', '$2b$10$rQj.8b8QZ8pK5gKkK5bKQu1V9GqK5gKkK5bKQu1V9GqK5gKkK5bK', 'director'),
('hr@company.com', '$2b$10$rQj.8b8QZ8pK5gKkK5bKQu1V9GqK5gKkK5bKQu1V9GqK5gKkK5bK', 'hr'),
('manager@company.com', '$2b$10$rQj.8b8QZ8pK5gKkK5bKQu1V9GqK5gKkK5bKQu1V9GqK5gKkK5bK', 'manager'),
('employee1@company.com', '$2b$10$rQj.8b8QZ8pK5gKkK5bKQu1V9GqK5gKkK5bKQu1V9GqK5gKkK5bK', 'employee'),
('employee2@company.com', '$2b$10$rQj.8b8QZ8pK5gKkK5bKQu1V9GqK5gKkK5bKQu1V9GqK5gKkK5bK', 'employee');

-- Insert sample departments
INSERT INTO departments (name, description) VALUES
('Phòng Nhân sự', 'Phòng quản lý nhân sự và tuyển dụng'),
('Phòng Kỹ thuật', 'Phòng phát triển sản phẩm và công nghệ'),
('Phòng Kinh doanh', 'Phòng bán hàng và marketing'),
('Phòng Tài chính', 'Phòng kế toán và tài chính');

-- Insert sample employees
INSERT INTO employees (user_id, employee_code, full_name, phone, address, date_of_birth, hire_date, position, department_id, salary, photo_url) VALUES
(1, 'EMP001', 'Nguyễn Văn Admin', '0901234567', '123 Đường ABC, Quận 1, TP.HCM', '1985-01-15', '2020-01-01', 'Quản trị viên hệ thống', 1, 25000000, null),
(2, 'EMP002', 'Trần Thị Director', '0901234568', '456 Đường DEF, Quận 2, TP.HCM', '1980-05-20', '2019-06-01', 'Giám đốc', null, 50000000, null),
(3, 'EMP003', 'Lê Văn HR', '0901234569', '789 Đường GHI, Quận 3, TP.HCM', '1988-09-10', '2021-03-15', 'Chuyên viên nhân sự', 1, 18000000, null),
(4, 'EMP004', 'Phạm Thị Manager', '0901234570', '321 Đường JKL, Quận 4, TP.HCM', '1987-12-25', '2020-09-01', 'Trưởng phòng Kỹ thuật', 2, 30000000, null),
(5, 'EMP005', 'Hoàng Văn Employee', '0901234571', '654 Đường MNO, Quận 5, TP.HCM', '1992-03-08', '2022-01-10', 'Lập trình viên', 2, 15000000, null),
(6, 'EMP006', 'Vũ Thị Employee', '0901234572', '987 Đường PQR, Quận 6, TP.HCM', '1990-07-14', '2021-11-20', 'Nhân viên kinh doanh', 3, 12000000, null);

-- Update department managers
UPDATE departments SET manager_id = 4 WHERE name = 'Phòng Kỹ thuật';
UPDATE departments SET manager_id = 3 WHERE name = 'Phòng Nhân sự';

-- Insert sample timesheets with realistic check-in/check-out times
INSERT INTO timesheets (employee_id, check_in, check_out, work_date, total_hours) VALUES
-- Employee 1: On time (7:00 AM - 5:00 PM)
(1, CURRENT_DATE + INTERVAL '7 hours', CURRENT_DATE + INTERVAL '17 hours', CURRENT_DATE, 8),
-- Employee 3: Late 15 minutes (7:15 AM - 5:00 PM)
(3, CURRENT_DATE + INTERVAL '7 hours 15 minutes', CURRENT_DATE + INTERVAL '17 hours', CURRENT_DATE, 7.75),
-- Employee 4: Early 15 minutes but leave early 15 minutes (6:45 AM - 4:45 PM)
(4, CURRENT_DATE + INTERVAL '6 hours 45 minutes', CURRENT_DATE + INTERVAL '16 hours 45 minutes', CURRENT_DATE, 8),
-- Employee 5: Late 30 minutes (7:30 AM - 5:30 PM)
(5, CURRENT_DATE + INTERVAL '7 hours 30 minutes', CURRENT_DATE + INTERVAL '17 hours 30 minutes', CURRENT_DATE, 8);

-- Insert sample leave requests
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status) VALUES
(5, 'annual', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '9 days', 3, 'Nghỉ phép thăm gia đình', 'pending'),
(6, 'sick', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', 1, 'Ốm sốt', 'approved');
