-- Add payroll configuration to system_config
INSERT INTO system_config (config_key, config_value, description) VALUES
('working_days_per_month', '22', 'Standard working days per month'),
('overtime_rate', '1.5', 'Overtime pay rate multiplier'),
('tax_rate', '10', 'Income tax rate percentage'),
('insurance_rate', '8', 'Social insurance rate percentage'),
('late_penalty_per_day', '50000', 'Penalty amount for late arrival per day (VND)'),
('early_leave_penalty_per_day', '50000', 'Penalty amount for early leave per day (VND)')
ON CONFLICT (config_key) DO UPDATE SET 
  config_value = EXCLUDED.config_value,
  updated_at = CURRENT_TIMESTAMP;