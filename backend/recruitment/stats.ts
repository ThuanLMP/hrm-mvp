import { api } from "encore.dev/api";
import db from "../db";
import { RecruitmentStats } from "./types";

interface StatsRequest {
  startDate?: string;
  endDate?: string;
  departmentId?: number;
}

export const getRecruitmentStats = api<StatsRequest, RecruitmentStats>(
  { expose: true, method: "GET", path: "/recruitment/stats" },
  async (req) => {
    try {
      // Get basic stats without complex filtering for now
      const jobPostingsCount = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM job_postings
      `;

      const activeJobPostingsCount = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM job_postings WHERE status IN ('published', 'paused')
      `;

      const candidatesCount = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM candidates
      `;

      const applicationsCount = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM job_applications
      `;

      const interviewsScheduledCount = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM interviews WHERE status = 'scheduled'
      `;

      const hiredCount = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM job_applications WHERE status = 'hired'
      `;

      // Calculate conversion rate
      const totalApps = applicationsCount?.count || 0;
      const hired = hiredCount?.count || 0;
      const conversionRate = totalApps > 0 ? (hired / totalApps) * 100 : 0;

      // Simple average time to hire calculation
      const avgTimeToHire = 15; // Default to 15 days for now

      return {
        totalJobPostings: jobPostingsCount?.count || 0,
        activeJobPostings: activeJobPostingsCount?.count || 0,
        totalCandidates: candidatesCount?.count || 0,
        totalApplications: totalApps,
        interviewsScheduled: interviewsScheduledCount?.count || 0,
        hiredCount: hired,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        averageTimeToHire: avgTimeToHire,
      };
    } catch (error) {
      console.error('Error in getRecruitmentStats:', error);
      // Return default stats if there's an error
      return {
        totalJobPostings: 0,
        activeJobPostings: 0,
        totalCandidates: 0,
        totalApplications: 0,
        interviewsScheduled: 0,
        hiredCount: 0,
        conversionRate: 0,
        averageTimeToHire: 0,
      };
    }
  }
);