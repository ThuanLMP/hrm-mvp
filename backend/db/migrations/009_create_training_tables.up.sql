CREATE TABLE training_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE training_courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES training_categories(id),
  instructor VARCHAR(255),
  duration_hours INTEGER,
  max_participants INTEGER,
  start_date DATE,
  end_date DATE,
  location VARCHAR(255),
  course_type VARCHAR(50) DEFAULT 'in-person' CHECK (course_type IN ('in-person', 'online', 'hybrid')),
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'ongoing', 'completed', 'cancelled')),
  cost DECIMAL(15,2),
  image_url TEXT,
  created_by INTEGER REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE training_enrollments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES training_courses(id),
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped', 'failed')),
  completion_percentage INTEGER DEFAULT 0,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  certificate_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, employee_id)
);

CREATE INDEX idx_training_courses_category_id ON training_courses(category_id);
CREATE INDEX idx_training_courses_status ON training_courses(status);
CREATE INDEX idx_training_courses_start_date ON training_courses(start_date);
CREATE INDEX idx_training_enrollments_course_id ON training_enrollments(course_id);
CREATE INDEX idx_training_enrollments_employee_id ON training_enrollments(employee_id);
CREATE INDEX idx_training_enrollments_status ON training_enrollments(status);

-- Insert sample training categories
INSERT INTO training_categories (name, description, icon, color) VALUES 
('Kỹ năng lãnh đạo', 'Phát triển kỹ năng lãnh đạo và quản lý', '👥', 'blue'),
('Công nghệ thông tin', 'Đào tạo về công nghệ và lập trình', '💻', 'green'),
('Tài chính kế toán', 'Kiến thức về tài chính và kế toán', '💰', 'yellow'),
('Marketing & Bán hàng', 'Kỹ năng marketing và bán hàng', '📈', 'purple'),
('Kỹ năng mềm', 'Giao tiếp, thuyết trình, làm việc nhóm', '🗣️', 'pink'),
('An toàn lao động', 'Đào tạo về an toàn và sức khỏe', '🛡️', 'red');

-- Insert sample training courses
INSERT INTO training_courses (title, description, category_id, instructor, duration_hours, max_participants, start_date, end_date, location, course_type, status, cost) VALUES 
('Kỹ năng lãnh đạo hiệu quả', 'Khóa học giúp phát triển kỹ năng lãnh đạo và quản lý nhóm hiệu quả', 1, 'Nguyễn Văn Minh', 24, 20, '2024-02-01', '2024-02-15', 'Phòng hội thảo A', 'in-person', 'ongoing', 5000000),
('Phát triển ứng dụng React', 'Khóa học lập trình React từ cơ bản đến nâng cao với các dự án thực tế', 2, 'Trần Thị Hoa', 40, 15, '2024-01-15', '2024-03-15', 'Phòng máy tính B', 'hybrid', 'ongoing', 8000000),
('Quản lý tài chính doanh nghiệp', 'Tài liệu và hướng dẫn chi tiết về quản lý tài chính ngân sách công ty', 3, 'Lê Văn Đức', 16, 25, '2024-02-10', '2024-02-20', 'Online', 'online', 'completed', 3000000);