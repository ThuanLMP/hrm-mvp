-- Update work start time to 7:00 AM
UPDATE system_config 
SET config_value = '07:00', 
    updated_at = CURRENT_TIMESTAMP 
WHERE config_key = 'work_start_time';

-- Clear existing sample timesheet data to avoid confusion
DELETE FROM timesheets WHERE employee_id IN (1, 3, 4, 5);

-- Insert new sample timesheets with realistic check-in/check-out times based on 7:00 AM start
INSERT INTO timesheets (employee_id, check_in, check_out, work_date, total_hours) VALUES
-- Employee 1: On time (7:00 AM - 5:00 PM)
(1, CURRENT_DATE + INTERVAL '7 hours', CURRENT_DATE + INTERVAL '17 hours', CURRENT_DATE, 10),
-- Employee 3: Late 15 minutes (7:15 AM - 5:00 PM)
(3, CURRENT_DATE + INTERVAL '7 hours 15 minutes', CURRENT_DATE + INTERVAL '17 hours', CURRENT_DATE, 9.75),
-- Employee 4: Early 15 minutes but leave early 15 minutes (6:45 AM - 4:45 PM)
(4, CURRENT_DATE + INTERVAL '6 hours 45 minutes', CURRENT_DATE + INTERVAL '16 hours 45 minutes', CURRENT_DATE, 10),
-- Employee 5: Late 30 minutes (7:30 AM - 5:30 PM)
(5, CURRENT_DATE + INTERVAL '7 hours 30 minutes', CURRENT_DATE + INTERVAL '17 hours 30 minutes', CURRENT_DATE, 10);