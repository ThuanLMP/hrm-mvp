import { api } from "encore.dev/api";
import db from "../db";
import type { CreateInsuranceRequest, InsuranceRecord } from "./types";

export const create = api(
  { method: "POST", path: "/insurance", expose: true },
  async (req: CreateInsuranceRequest): Promise<InsuranceRecord> => {
    // Generate ID in format yymmdd_[ID HSNV]_ab
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const employeeId = req.employee_id.toString().padStart(4, '0');
    
    // Find next available suffix (ab, ac, ad, etc.)
    const baseId = `${year}${month}${day}_${employeeId}_`;
    const existingIds = await db.query<{id: string}>`
      SELECT id FROM insurance_records 
      WHERE id LIKE ${baseId + '%'}
      ORDER BY id DESC
      LIMIT 1
    `;
    
    let suffix = 'aa';
    for await (const row of existingIds) {
      const lastSuffix = row.id.split('_')[2];
      // Increment suffix (aa -> ab -> ac, etc.)
      const lastChar = lastSuffix.charCodeAt(1);
      if (lastChar < 122) { // 'z'
        suffix = lastSuffix.charAt(0) + String.fromCharCode(lastChar + 1);
      } else {
        const firstChar = String.fromCharCode(lastSuffix.charCodeAt(0) + 1);
        suffix = firstChar + 'a';
      }
      break; // Only process the first (most recent) record
    }
    
    const id = baseId + suffix;
    
    const result = await db.queryRow<InsuranceRecord>`
      INSERT INTO insurance_records (
        id, employee_id, company_unit, contract_date, id_number, id_issue_date, 
        id_issue_place, cccd_expiry_date, household_registration, place_of_origin,
        tax_code, social_insurance_number, bank_account, bank_name, marital_status,
        number_of_children, is_shared, created_by, status, notes
      ) VALUES (
        ${id}, ${req.employee_id}, ${req.company_unit}, ${req.contract_date}, 
        ${req.id_number}, ${req.id_issue_date}, ${req.id_issue_place}, 
        ${req.cccd_expiry_date}, ${req.household_registration}, ${req.place_of_origin},
        ${req.tax_code}, ${req.social_insurance_number}, ${req.bank_account}, 
        ${req.bank_name}, ${req.marital_status}, ${req.number_of_children || 0},
        ${req.is_shared || false}, ${1}, 
        ${req.status || 'active'}, ${req.notes}
      )
      RETURNING *
    `;

    if (!result) {
      throw new Error("Failed to create insurance record");
    }

    return result;
  }
);