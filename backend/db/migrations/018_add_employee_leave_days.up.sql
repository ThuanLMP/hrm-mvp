-- Add leave days fields to employees table
ALTER TABLE employees ADD COLUMN annual_leave_days INTEGER;
ALTER TABLE employees ADD COLUMN sick_leave_days INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN employees.annual_leave_days IS 'Annual leave days per year for this employee. If NULL, uses system default.';
COMMENT ON COLUMN employees.sick_leave_days IS 'Sick leave days per year for this employee. If NULL, uses system default.';
