CREATE TABLE insurance_records (
    id VARCHAR(50) PRIMARY KEY, -- yymmdd_[ID HSNV]_ab format
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date_created TIMESTAMP NOT NULL DEFAULT NOW(),
    company_unit VARCHAR(255) NOT NULL,
    contract_date DATE,
    id_number VARCHAR(50),
    id_issue_date DATE,
    id_issue_place VARCHAR(255),
    cccd_expiry_date DATE,
    household_registration TEXT,
    place_of_origin VARCHAR(255),
    tax_code VARCHAR(50),
    social_insurance_number VARCHAR(50),
    bank_account VARCHAR(50),
    bank_name VARCHAR(255),
    marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    number_of_children INTEGER DEFAULT 0,
    is_shared BOOLEAN DEFAULT false,
    created_by INTEGER NOT NULL REFERENCES employees(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_insurance_employee_id ON insurance_records(employee_id);
CREATE INDEX idx_insurance_status ON insurance_records(status);
CREATE INDEX idx_insurance_created_by ON insurance_records(created_by);
CREATE INDEX idx_insurance_tax_code ON insurance_records(tax_code);
CREATE INDEX idx_insurance_social_insurance ON insurance_records(social_insurance_number);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_insurance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_insurance_updated_at
    BEFORE UPDATE ON insurance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_updated_at();