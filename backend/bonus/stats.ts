import { api } from "encore.dev/api";
import db from "../db";
import { BonusStats } from "./types";

interface StatsRequest {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
}

export const stats = api<StatsRequest, BonusStats>(
  { expose: true, method: "GET", path: "/bonuses/stats" },
  async (req) => {
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.startDate) {
      whereClause += ` AND b.award_date >= $${paramIndex}`;
      params.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      whereClause += ` AND b.award_date <= $${paramIndex}`;
      params.push(req.endDate);
      paramIndex++;
    }

    if (req.employeeId) {
      whereClause += ` AND b.employee_id = $${paramIndex}`;
      params.push(req.employeeId);
      paramIndex++;
    }

    const statsQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as total_amount,
        COUNT(*) as total_count,
        COALESCE(AVG(CASE WHEN status = 'approved' THEN amount ELSE NULL END), 0) as average_amount,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
      FROM bonuses b
      ${whereClause}
    `;

    const currentStats = await db.rawQueryRow<any>(statsQuery, ...params);

    // Calculate monthly growth (compare with previous month)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthStats = await db.rawQueryRow<any>(`
      SELECT COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as last_month_amount
      FROM bonuses b
      WHERE b.award_date >= $1 AND b.award_date < $2
    `, [lastMonth.toISOString().split('T')[0], currentMonth.toISOString().split('T')[0]]);

    const thisMonthStats = await db.rawQueryRow<any>(`
      SELECT COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as this_month_amount
      FROM bonuses b
      WHERE b.award_date >= $1
    `, [currentMonth.toISOString().split('T')[0]]);

    let monthlyGrowth = 0;
    if (lastMonthStats?.last_month_amount > 0) {
      monthlyGrowth = ((thisMonthStats?.this_month_amount - lastMonthStats?.last_month_amount) / lastMonthStats?.last_month_amount) * 100;
    }

    return {
      totalAmount: parseFloat(currentStats?.total_amount || 0),
      totalCount: parseInt(currentStats?.total_count || 0),
      averageAmount: parseFloat(currentStats?.average_amount || 0),
      approvedCount: parseInt(currentStats?.approved_count || 0),
      pendingCount: parseInt(currentStats?.pending_count || 0),
      rejectedCount: parseInt(currentStats?.rejected_count || 0),
      monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
    };
  }
);