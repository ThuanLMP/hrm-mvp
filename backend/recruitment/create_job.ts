import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { CreateJobPostingRequest, JobPosting } from "./types";
import { verifySimpleToken } from "../auth/tokenUtils";

interface CreateJobPostingRequestWithAuth extends CreateJobPostingRequest {
  authorization: Header<"Authorization">;
}

export const createJobPosting = api<CreateJobPostingRequestWithAuth, JobPosting>(
  { expose: true, method: "POST", path: "/recruitment/jobs" },
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
    
    if (user.role !== 'admin' && user.role !== 'hr') {
      throw APIError.permissionDenied("Only admins and HR can create job postings");
    }

    const { authorization, ...jobData } = req;

    // Verify department exists if provided
    if (jobData.departmentId) {
      const department = await db.queryRow`
        SELECT id FROM departments WHERE id = ${jobData.departmentId}
      `;
      if (!department) {
        throw APIError.notFound("Department not found");
      }
    }

    const job = await db.queryRow<any>`
      INSERT INTO job_postings (
        title, description, department_id, location, employment_type, experience_level,
        salary_min, salary_max, requirements, benefits, skills, deadline, created_by
      )
      VALUES (
        ${jobData.title}, ${jobData.description}, ${jobData.departmentId},
        ${jobData.location}, ${jobData.employmentType}, ${jobData.experienceLevel},
        ${jobData.salaryMin ? jobData.salaryMin.toString() : null},
        ${jobData.salaryMax ? jobData.salaryMax.toString() : null},
        ${jobData.requirements}, ${jobData.benefits}, 
        ${jobData.skills ? JSON.stringify(jobData.skills) : null},
        ${jobData.deadline ? jobData.deadline.toISOString().split('T')[0] : null},
        ${parseInt(user.userID)}
      )
      RETURNING 
        id, title, description, department_id, location, employment_type, experience_level,
        salary_min, salary_max, currency, requirements, benefits, skills, status,
        posted_date, deadline, created_by, created_at, updated_at
    `;

    if (!job) {
      throw APIError.internal("Failed to create job posting");
    }

    // Get related data
    const departmentData = jobData.departmentId ? await db.queryRow`
      SELECT name FROM departments WHERE id = ${job.department_id}
    ` : null;

    const creatorData = await db.queryRow`
      SELECT full_name FROM employees WHERE id = ${job.created_by}
    `;

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      departmentId: job.department_id,
      departmentName: departmentData?.name,
      location: job.location,
      employmentType: job.employment_type,
      experienceLevel: job.experience_level,
      salaryMin: job.salary_min ? parseFloat(job.salary_min) : undefined,
      salaryMax: job.salary_max ? parseFloat(job.salary_max) : undefined,
      currency: job.currency,
      requirements: job.requirements,
      benefits: job.benefits,
      skills: job.skills && job.skills !== 'null' ? JSON.parse(job.skills) : undefined,
      status: job.status,
      postedDate: job.posted_date,
      deadline: job.deadline,
      createdBy: job.created_by,
      createdByName: creatorData?.full_name,
      applicationsCount: 0,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    };
  }
);