CREATE TABLE bonus_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bonuses (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  bonus_type_id INTEGER NOT NULL REFERENCES bonus_types(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  award_date DATE NOT NULL,
  approved_by INTEGER REFERENCES employees(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_by INTEGER REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bonuses_employee_id ON bonuses(employee_id);
CREATE INDEX idx_bonuses_status ON bonuses(status);
CREATE INDEX idx_bonuses_award_date ON bonuses(award_date);
CREATE INDEX idx_bonus_types_is_active ON bonus_types(is_active);

-- Insert sample bonus types
INSERT INTO bonus_types (name, description, icon, color) VALUES 
('Hiệu suất', 'Thưởng hiệu suất công việc xuất sắc', '🎯', 'blue'),
('Dự án', 'Thưởng hoàn thành dự án thành công', '📊', 'green'),
('Sáng kiến', 'Thưởng đóng góp sáng kiến cải tiến', '💡', 'yellow'),
('Kỷ luật', 'Thưởng tuân thủ kỷ luật lao động', '⭐', 'purple'),
('Bán hàng', 'Thưởng đạt target bán hàng', '💰', 'orange'),
('Teamwork', 'Thưởng tinh thần đồng đội', '🤝', 'pink');