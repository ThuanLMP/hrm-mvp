-- Job postings table
CREATE TABLE job_postings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  location VARCHAR(255),
  employment_type VARCHAR(50) DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  experience_level VARCHAR(50) DEFAULT 'mid' CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  salary_min DECIMAL(15,2),
  salary_max DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'VND',
  requirements TEXT,
  benefits TEXT,
  skills TEXT, -- JSON array of required skills
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused', 'closed', 'filled')),
  posted_date DATE,
  deadline DATE,
  created_by INTEGER REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  education_level VARCHAR(50) CHECK (education_level IN ('high-school', 'bachelor', 'master', 'phd', 'other')),
  university VARCHAR(255),
  major VARCHAR(255),
  graduation_year INTEGER,
  experience_years INTEGER DEFAULT 0,
  current_position VARCHAR(255),
  current_company VARCHAR(255),
  skills TEXT, -- JSON array of skills
  linkedin_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  resume_url VARCHAR(500),
  cover_letter TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'shortlisted', 'interviewing', 'hired', 'rejected', 'withdrawn')),
  source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'linkedin', 'referral', 'job-board', 'social-media', 'other')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job applications table (many-to-many between candidates and job postings)
CREATE TABLE job_applications (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id),
  job_posting_id INTEGER NOT NULL REFERENCES job_postings(id),
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied', 'reviewing', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  resume_url VARCHAR(500),
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(candidate_id, job_posting_id)
);

-- Interviews table
CREATE TABLE interviews (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES job_applications(id),
  interview_type VARCHAR(50) DEFAULT 'phone' CHECK (interview_type IN ('phone', 'video', 'in-person', 'technical', 'panel', 'final')),
  interview_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location VARCHAR(255),
  meeting_link VARCHAR(500),
  interviewer_ids TEXT, -- JSON array of employee IDs
  interviewer_names TEXT, -- JSON array of interviewer names
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  result VARCHAR(20) CHECK (result IN ('pass', 'fail', 'pending')),
  next_steps TEXT,
  created_by INTEGER REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview evaluations (detailed feedback from each interviewer)
CREATE TABLE interview_evaluations (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER NOT NULL REFERENCES interviews(id),
  interviewer_id INTEGER NOT NULL REFERENCES employees(id),
  technical_skills INTEGER CHECK (technical_skills >= 1 AND technical_skills <= 5),
  communication_skills INTEGER CHECK (communication_skills >= 1 AND communication_skills <= 5),
  problem_solving INTEGER CHECK (problem_solving >= 1 AND problem_solving <= 5),
  cultural_fit INTEGER CHECK (cultural_fit >= 1 AND cultural_fit <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  strengths TEXT,
  weaknesses TEXT,
  feedback TEXT,
  recommendation VARCHAR(20) CHECK (recommendation IN ('hire', 'no-hire', 'maybe')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(interview_id, interviewer_id)
);

-- Indexes for better performance
CREATE INDEX idx_job_postings_department_id ON job_postings(department_id);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_posted_date ON job_postings(posted_date);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX idx_job_applications_job_posting_id ON job_applications(job_posting_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_interview_date ON interviews(interview_date);
CREATE INDEX idx_interviews_status ON interviews(status);

-- Insert sample job postings
INSERT INTO job_postings (title, description, department_id, location, employment_type, experience_level, salary_min, salary_max, requirements, benefits, skills, status, posted_date, deadline, created_by) VALUES 
(
  'Senior Frontend Developer',
  'Chúng tôi đang tìm kiếm một Senior Frontend Developer có kinh nghiệm với React, TypeScript để tham gia đội ngũ phát triển sản phẩm.',
  (SELECT id FROM departments WHERE name = 'Công nghệ thông tin' LIMIT 1),
  'Hồ Chí Minh',
  'full-time',
  'senior',
  25000000,
  35000000,
  '- Tối thiểu 4 năm kinh nghiệm phát triển Frontend\n- Thành thạo React, TypeScript, HTML5, CSS3\n- Kinh nghiệm với các thư viện UI như Material-UI, Ant Design\n- Hiểu biết về RESTful APIs và GraphQL',
  '- Lương cạnh tranh, thưởng theo hiệu suất\n- Bảo hiểm sức khỏe toàn diện\n- Cơ hội đào tạo và phát triển\n- Môi trường làm việc hiện đại',
  '["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Git", "Webpack"]',
  'published',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  1
),
(
  'Marketing Manager',
  'Vị trí Marketing Manager sẽ chịu trách nhiệm phát triển và thực hiện các chiến lược marketing để tăng trưởng thương hiệu.',
  (SELECT id FROM departments WHERE name = 'Marketing' LIMIT 1),
  'Hà Nội',
  'full-time',
  'mid',
  20000000,
  30000000,
  '- Tối thiểu 3 năm kinh nghiệm trong lĩnh vực Marketing\n- Kinh nghiệm quản lý team và dự án\n- Thành thạo digital marketing và social media\n- Khả năng phân tích dữ liệu và báo cáo',
  '- Môi trường làm việc sáng tạo\n- Ngân sách marketing linh hoạt\n- Cơ hội thăng tiến nhanh\n- Team building định kỳ',
  '["Digital Marketing", "Social Media", "Content Marketing", "Analytics", "Project Management"]',
  'published',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '25 days',
  1
),
(
  'HR Business Partner',
  'Tham gia vào việc phát triển và thực hiện các chính sách nhân sự, hỗ trợ các phòng ban trong việc quản lý nhân viên.',
  (SELECT id FROM departments WHERE name = 'Nhân sự' LIMIT 1),
  'Đà Nẵng',
  'full-time',
  'mid',
  18000000,
  25000000,
  '- Tối thiểu 2 năm kinh nghiệm trong lĩnh vực HR\n- Kiến thức về luật lao động Việt Nam\n- Kỹ năng tư vấn và giải quyết vấn đề\n- Khả năng làm việc độc lập và theo nhóm',
  '- Được đào tạo chuyên sâu về HR\n- Cơ hội làm việc với các chuyên gia\n- Chế độ phúc lợi tốt\n- Work-life balance',
  '["HR Management", "Labor Law", "Recruitment", "Training", "Communication"]',
  'published',
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '20 days',
  1
);

-- Insert sample candidates
INSERT INTO candidates (first_name, last_name, email, phone, address, education_level, university, major, graduation_year, experience_years, current_position, current_company, skills, status, source) VALUES 
(
  'Nguyễn',
  'Văn An',
  'nguyenvanan@email.com',
  '0901234567',
  'Quận 1, TP.HCM',
  'bachelor',
  'Đại học Bách Khoa TP.HCM',
  'Công nghệ thông tin',
  2020,
  3,
  'Frontend Developer',
  'ABC Tech Company',
  '["React", "JavaScript", "TypeScript", "Node.js", "Git"]',
  'new',
  'website'
),
(
  'Trần',
  'Thị Bình',
  'tranthib@email.com',
  '0902345678',
  'Quận Hai Bà Trưng, Hà Nội',
  'master',
  'Đại học Kinh tế Quốc dân',
  'Marketing',
  2019,
  4,
  'Senior Marketing Specialist',
  'XYZ Marketing Agency',
  '["Digital Marketing", "Google Ads", "Facebook Ads", "Content Marketing", "Analytics"]',
  'reviewing',
  'linkedin'
),
(
  'Lê',
  'Minh Cường',
  'leminhcuong@email.com',
  '0903456789',
  'Quận Hải Châu, Đà Nẵng',
  'bachelor',
  'Đại học Đà Nẵng',
  'Quản trị nhân lực',
  2021,
  2,
  'HR Coordinator',
  'DEF Corporation',
  '["HR Management", "Recruitment", "Training", "Labor Law"]',
  'shortlisted',
  'referral'
);