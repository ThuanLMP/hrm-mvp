-- Ensure all numeric columns use DOUBLE PRECISION for better Encore compatibility
-- This migration ensures consistent numeric types across the database

-- Update any potential NUMERIC columns to DOUBLE PRECISION
-- (This is a precautionary migration in case there are any NUMERIC types)

-- Check and update salary column if needed
DO $$
BEGIN
    -- Check if salary column exists and is not already DOUBLE PRECISION
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'salary' 
        AND data_type != 'double precision'
    ) THEN
        ALTER TABLE employees ALTER COLUMN salary TYPE DOUBLE PRECISION;
    END IF;
END $$;

-- Check and update overtime_hours column if needed
DO $$
BEGIN
    -- Check if overtime_hours column exists and is not already DOUBLE PRECISION
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'timesheets' 
        AND column_name = 'overtime_hours' 
        AND data_type != 'double precision'
    ) THEN
        ALTER TABLE timesheets ALTER COLUMN overtime_hours TYPE DOUBLE PRECISION;
    END IF;
END $$;

-- Check and update total_hours column if needed
DO $$
BEGIN
    -- Check if total_hours column exists and is not already DOUBLE PRECISION
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'timesheets' 
        AND column_name = 'total_hours' 
        AND data_type != 'double precision'
    ) THEN
        ALTER TABLE timesheets ALTER COLUMN total_hours TYPE DOUBLE PRECISION;
    END IF;
END $$;
