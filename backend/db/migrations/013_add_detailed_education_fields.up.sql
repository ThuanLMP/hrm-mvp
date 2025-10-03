-- Add detailed education fields to employees table
ALTER TABLE employees ADD COLUMN school_name VARCHAR(255);
ALTER TABLE employees ADD COLUMN major VARCHAR(255);
ALTER TABLE employees ADD COLUMN graduation_year INTEGER;
ALTER TABLE employees ADD COLUMN training_system VARCHAR(100);
ALTER TABLE employees ADD COLUMN degree_classification VARCHAR(100);

-- Note: training_systems and degree_classifications are now hardcoded in the frontend
-- No additional system_config entries needed for these fields
