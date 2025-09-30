import { api, APIError, Header } from "encore.dev/api";
import { verifySimpleToken } from "../auth/tokenUtils";
import db from "../db";
import { Bonus, CreateBonusRequest } from "./types";

interface CreateBonusRequestWithAuth extends CreateBonusRequest {
  authorization: Header<"Authorization">;
}

export const toDecimalNumber = (value: unknown): number => {
  if (typeof value === "number") {
    if (!isFinite(value)) throw new Error("Invalid decimal input");
    return Math.round(value * 100) / 100;
  }
  if (typeof value === "bigint") {
    const n = Number(value);
    if (!isFinite(n)) throw new Error("Invalid bigint decimal input");
    return Math.round(n * 100) / 100;
  }
  if (typeof value === "string") {
    const n = Number(value.trim());
    if (!isFinite(n)) throw new Error(`Invalid decimal string: ${value}`);
    return Math.round(n * 100) / 100;
  }
  throw new Error(`Invalid decimal input type: ${typeof value}`);
};

export const toDecimalText = (value: unknown): string => {
  const n = toDecimalNumber(value);
  // đảm bảo đúng định dạng thập phân có 2 chữ số
  return n.toFixed(2);
};

export const create = api<CreateBonusRequestWithAuth, Bonus>(
  { expose: true, method: "POST", path: "/bonuses" },
  async (req) => {
    const token = req.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("Token không hợp lệ");
    }

    let user;
    try {
      user = verifySimpleToken(token);
    } catch (error) {
      throw APIError.unauthenticated("Token không hợp lệ");
    }

    if (user.role !== "admin" && user.role !== "hr") {
      throw APIError.permissionDenied("Only admins and HR can create bonuses");
    }

    const { authorization, ...bonusData } = req;

    // Verify employee exists
    const employee = await db.queryRow`
      SELECT id FROM employees WHERE id = ${bonusData.employeeId}
    `;
    if (!employee) {
      throw APIError.notFound("Employee not found");
    }

    // Verify bonus type exists
    const bonusType = await db.queryRow`
      SELECT id FROM bonus_types WHERE id = ${bonusData.bonusTypeId} AND is_active = true
    `;
    if (!bonusType) {
      throw APIError.notFound("Bonus type not found");
    }

    const employeeId = Number(bonusData.employeeId);
    const bonusTypeId = Number(bonusData.bonusTypeId);
    const title = String(bonusData.title);
    const description = bonusData.description ?? null;
    const totalAmountText = toDecimalText(bonusData.amount);
    const awardDate = bonusData.awardDate.toISOString().slice(0, 10);
    const createdBy = Number(user.userID);
    const bonus = await db.queryRow<any>`
      INSERT INTO bonuses (
        employee_id, bonus_type_id, title, description, amount, award_date, created_by
      )
      VALUES (
        ${employeeId},
        ${bonusTypeId},
        ${title},
        ${description},
        to_number(${totalAmountText}, 'FM999999999.00'),
        ${awardDate},
        ${createdBy}
      )
      RETURNING 
        id, employee_id, bonus_type_id, title, description, 
        CAST(amount AS TEXT) as amount,
        status, award_date, approved_by, approved_at, rejection_reason,
        created_by, created_at, updated_at
    `;

    if (!bonus) {
      throw APIError.internal("Failed to create bonus");
    }

    // Get related data
    const employeeData = await db.queryRow`
      SELECT full_name, employee_code FROM employees WHERE id = ${bonus.employee_id}
    `;

    const bonusTypeData = await db.queryRow`
      SELECT name, icon, color FROM bonus_types WHERE id = ${bonus.bonus_type_id}
    `;

    const creatorData = await db.queryRow`
      SELECT full_name FROM employees WHERE id = ${bonus.created_by}
    `;

    return {
      id: bonus.id,
      employeeId: bonus.employee_id,
      employeeName: employeeData?.full_name,
      employeeCode: employeeData?.employee_code,
      bonusTypeId: bonus.bonus_type_id,
      bonusTypeName: bonusTypeData?.name,
      bonusTypeIcon: bonusTypeData?.icon,
      bonusTypeColor: bonusTypeData?.color,
      title: bonus.title,
      description: bonus.description,
      amount: parseFloat(bonus.amount),
      status: bonus.status,
      awardDate: bonus.award_date,
      approvedBy: bonus.approved_by,
      approvedAt: bonus.approved_at,
      rejectionReason: bonus.rejection_reason,
      createdBy: bonus.created_by,
      createdByName: creatorData?.full_name,
      createdAt: bonus.created_at,
      updatedAt: bonus.updated_at,
    };
  }
);
