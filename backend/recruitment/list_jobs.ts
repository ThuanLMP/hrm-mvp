import { api, Query } from "encore.dev/api";
import db from "../db";
import { ListJobPostingsResponse, JobPosting } from "./types";

interface ListJobPostingsRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  departmentId?: Query<number>;
  status?: Query<string>;
  employmentType?: Query<string>;
  experienceLevel?: Query<string>;
  search?: Query<string>;
}

export const listJobPostings = api<ListJobPostingsRequest, ListJobPostingsResponse>(
  { expose: true, method: "GET", path: "/recruitment/jobs" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    try {
      // For now, let's use a simple query without complex filtering to avoid SQL injection issues
      const rawJobPostings = await db.queryAll<any>`
        SELECT 
          j.id, j.title, j.description, j.department_id, j.location, j.employment_type,
          j.experience_level, j.salary_min, j.salary_max, j.currency, j.requirements,
          j.benefits, j.skills, j.status, j.posted_date, j.deadline, j.created_by,
          j.created_at, j.updated_at,
          d.name as department_name,
          creator.full_name as created_by_name,
          COUNT(DISTINCT app.id) as applications_count
        FROM job_postings j
        LEFT JOIN departments d ON j.department_id = d.id
        LEFT JOIN employees creator ON j.created_by = creator.id
        LEFT JOIN job_applications app ON j.id = app.job_posting_id
        GROUP BY j.id, d.name, creator.full_name
        ORDER BY j.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const jobPostings = rawJobPostings.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        departmentId: row.department_id,
        departmentName: row.department_name,
        location: row.location,
        employmentType: row.employment_type,
        experienceLevel: row.experience_level,
        salaryMin: row.salary_min ? parseFloat(row.salary_min) : undefined,
        salaryMax: row.salary_max ? parseFloat(row.salary_max) : undefined,
        currency: row.currency,
        requirements: row.requirements,
        benefits: row.benefits,
        skills: row.skills && row.skills !== 'null' ? JSON.parse(row.skills) : undefined,
        status: row.status,
        postedDate: row.posted_date,
        deadline: row.deadline,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        applicationsCount: parseInt(row.applications_count || 0),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      const countResult = await db.queryRow<{ total: number }>`
        SELECT COUNT(*) as total FROM job_postings
      `;

      return {
        jobPostings,
        total: countResult?.total || 0,
      };
    } catch (error) {
      console.error('Error in listJobPostings:', error);
      throw new Error('Failed to fetch job postings');
    }
  }
);