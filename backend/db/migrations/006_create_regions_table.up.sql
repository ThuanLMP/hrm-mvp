CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regions_code ON regions(code);
CREATE INDEX idx_regions_is_active ON regions(is_active);

INSERT INTO regions (name, code, description) VALUES 
('Hồ Chí Minh', 'HCM', 'Thành phố Hồ Chí Minh'),
('Hà Nội', 'HN', 'Thủ đô Hà Nội'),
('Đà Nẵng', 'DN', 'Thành phố Đà Nẵng');