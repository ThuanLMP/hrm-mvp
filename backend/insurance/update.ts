import { api } from "encore.dev/api";
import db from "../db";
import type { UpdateInsuranceRequest, InsuranceRecord } from "./types";

interface UpdateInsuranceParams {
  id: string;
}

export const update = api(
  { method: "PUT", path: "/insurance/:id", expose: true },
  async ({ id, ...req }: UpdateInsuranceParams & UpdateInsuranceRequest): Promise<InsuranceRecord> => {
    // Check if record exists
    const existing = await db.queryRow<{id: string}>`
      SELECT id FROM insurance_records WHERE id = ${id}
    `;

    if (!existing) {
      throw new Error("Insurance record not found");
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (req.company_unit !== undefined) {
      updates.push(`company_unit = $${updates.length + 1}`);
      values.push(req.company_unit);
    }

    if (req.contract_date !== undefined) {
      updates.push(`contract_date = $${updates.length + 1}`);
      values.push(req.contract_date);
    }

    if (req.id_number !== undefined) {
      updates.push(`id_number = $${updates.length + 1}`);
      values.push(req.id_number);
    }

    if (req.id_issue_date !== undefined) {
      updates.push(`id_issue_date = $${updates.length + 1}`);
      values.push(req.id_issue_date);
    }

    if (req.id_issue_place !== undefined) {
      updates.push(`id_issue_place = $${updates.length + 1}`);
      values.push(req.id_issue_place);
    }

    if (req.cccd_expiry_date !== undefined) {
      updates.push(`cccd_expiry_date = $${updates.length + 1}`);
      values.push(req.cccd_expiry_date);
    }

    if (req.household_registration !== undefined) {
      updates.push(`household_registration = $${updates.length + 1}`);
      values.push(req.household_registration);
    }

    if (req.place_of_origin !== undefined) {
      updates.push(`place_of_origin = $${updates.length + 1}`);
      values.push(req.place_of_origin);
    }

    if (req.tax_code !== undefined) {
      updates.push(`tax_code = $${updates.length + 1}`);
      values.push(req.tax_code);
    }

    if (req.social_insurance_number !== undefined) {
      updates.push(`social_insurance_number = $${updates.length + 1}`);
      values.push(req.social_insurance_number);
    }

    if (req.bank_account !== undefined) {
      updates.push(`bank_account = $${updates.length + 1}`);
      values.push(req.bank_account);
    }

    if (req.bank_name !== undefined) {
      updates.push(`bank_name = $${updates.length + 1}`);
      values.push(req.bank_name);
    }

    if (req.marital_status !== undefined) {
      updates.push(`marital_status = $${updates.length + 1}`);
      values.push(req.marital_status);
    }

    if (req.number_of_children !== undefined) {
      updates.push(`number_of_children = $${updates.length + 1}`);
      values.push(req.number_of_children);
    }

    if (req.is_shared !== undefined) {
      updates.push(`is_shared = $${updates.length + 1}`);
      values.push(req.is_shared);
    }

    if (req.status !== undefined) {
      updates.push(`status = $${updates.length + 1}`);
      values.push(req.status);
    }

    if (req.notes !== undefined) {
      updates.push(`notes = $${updates.length + 1}`);
      values.push(req.notes);
    }

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    // Use template literals for the update query
    let query = `
      UPDATE insurance_records 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = '${id}'
      RETURNING *
    `;

    // For now, let's use a simpler approach with conditional updates
    const result = await db.queryRow<InsuranceRecord>`
      UPDATE insurance_records 
      SET 
        company_unit = COALESCE(${req.company_unit}, company_unit),
        contract_date = COALESCE(${req.contract_date}, contract_date),
        id_number = COALESCE(${req.id_number}, id_number),
        id_issue_date = COALESCE(${req.id_issue_date}, id_issue_date),
        id_issue_place = COALESCE(${req.id_issue_place}, id_issue_place),
        cccd_expiry_date = COALESCE(${req.cccd_expiry_date}, cccd_expiry_date),
        household_registration = COALESCE(${req.household_registration}, household_registration),
        place_of_origin = COALESCE(${req.place_of_origin}, place_of_origin),
        tax_code = COALESCE(${req.tax_code}, tax_code),
        social_insurance_number = COALESCE(${req.social_insurance_number}, social_insurance_number),
        bank_account = COALESCE(${req.bank_account}, bank_account),
        bank_name = COALESCE(${req.bank_name}, bank_name),
        marital_status = COALESCE(${req.marital_status}, marital_status),
        number_of_children = COALESCE(${req.number_of_children}, number_of_children),
        is_shared = COALESCE(${req.is_shared}, is_shared),
        status = COALESCE(${req.status}, status),
        notes = COALESCE(${req.notes}, notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!result) {
      throw new Error("Failed to update insurance record");
    }

    return result;
  }
);