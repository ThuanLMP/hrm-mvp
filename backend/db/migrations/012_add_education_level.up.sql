-- Add education_level column to employees table
ALTER TABLE employees ADD COLUMN education_level VARCHAR(100);

-- Add education level configuration to system_config
INSERT INTO system_config (config_key, config_value, description) VALUES
('education_levels', 'Trung học cơ sở,Trung học phổ thông,Trung cấp,Cao đẳng,Đại học,Thạc sĩ,Tiến sĩ', 'Danh sách trình độ học vấn có thể chọn cho nhân viên');
