ALTER TABLE employees 
ADD COLUMN region_id INTEGER REFERENCES regions(id);