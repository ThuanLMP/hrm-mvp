import { api } from "encore.dev/api";
import db from "../db";
import { TrainingStats } from "./types";

interface StatsRequest {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
}

export const getStats = api<StatsRequest, TrainingStats>(
  { expose: true, method: "GET", path: "/training/stats" },
  async (req) => {
    const currentStats = await db.queryRow<any>`
      SELECT 
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT CASE WHEN c.status IN ('planning', 'ongoing') THEN c.id END) as active_courses,
        COUNT(DISTINCT e.id) as total_participants,
        CASE 
          WHEN COUNT(DISTINCT e.id) > 0 
          THEN (COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END)::float / COUNT(DISTINCT e.id)::float * 100)
          ELSE 0 
        END as completion_rate,
        CAST(COALESCE(SUM(DISTINCT c.cost), 0) AS TEXT) as total_cost,
        CAST(COALESCE(AVG(e.rating), 0) AS TEXT) as average_rating
      FROM training_courses c
      LEFT JOIN training_enrollments e ON c.id = e.course_id
      WHERE 1=1
        ${req.startDate ? `AND c.start_date >= ${req.startDate}` : ""}
        ${req.endDate ? `AND c.end_date <= ${req.endDate}` : ""}
        ${req.categoryId ? `AND c.category_id = ${req.categoryId}` : ""}
    `;

    // Calculate monthly growth (compare course creation with previous month)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthStats = await db.queryRow<any>`
      SELECT COUNT(*) as last_month_courses
      FROM training_courses c
      WHERE c.created_at >= ${lastMonth.toISOString().split("T")[0]} 
        AND c.created_at < ${currentMonth.toISOString().split("T")[0]}
    `;

    const thisMonthStats = await db.queryRow<any>`
      SELECT COUNT(*) as this_month_courses
      FROM training_courses c
      WHERE c.created_at >= ${currentMonth.toISOString().split("T")[0]}
    `;

    let monthlyGrowth = 0;
    if (lastMonthStats?.last_month_courses > 0) {
      monthlyGrowth =
        ((thisMonthStats?.this_month_courses -
          lastMonthStats?.last_month_courses) /
          lastMonthStats?.last_month_courses) *
        100;
    }

    return {
      totalCourses: parseInt(currentStats?.total_courses || 0),
      activeCourses: parseInt(currentStats?.active_courses || 0),
      totalParticipants: parseInt(currentStats?.total_participants || 0),
      completionRate: parseFloat(
        (currentStats?.completion_rate || 0).toFixed(1)
      ),
      totalCost: parseFloat(currentStats?.total_cost || "0"),
      averageRating: parseFloat(
        (currentStats?.average_rating || "0").toFixed(1)
      ),
      monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
    };
  }
);
