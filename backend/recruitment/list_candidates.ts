import { api, Query } from "encore.dev/api";
import db from "../db";
import { ListCandidatesResponse, Candidate } from "./types";

interface ListCandidatesRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  status?: Query<string>;
  experienceLevel?: Query<string>;
  source?: Query<string>;
  search?: Query<string>;
}

export const listCandidates = api<ListCandidatesRequest, ListCandidatesResponse>(
  { expose: true, method: "GET", path: "/recruitment/candidates" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    try {
      // Use simple query without complex filtering for now
      const rawCandidates = await db.queryAll<any>`
        SELECT 
          c.id, c.first_name, c.last_name, c.email, c.phone, c.address,
          c.date_of_birth, c.gender, c.education_level, c.university, c.major,
          c.graduation_year, c.experience_years, c.current_position, c.current_company,
          c.skills, c.linkedin_url, c.portfolio_url, c.resume_url, c.cover_letter,
          c.status, c.source, c.created_at, c.updated_at,
          COUNT(DISTINCT app.id) as applications_count
        FROM candidates c
        LEFT JOIN job_applications app ON c.id = app.candidate_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const candidates = rawCandidates.map(row => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        fullName: `${row.first_name} ${row.last_name}`,
        email: row.email,
        phone: row.phone,
        address: row.address,
        dateOfBirth: row.date_of_birth,
        gender: row.gender,
        educationLevel: row.education_level,
        university: row.university,
        major: row.major,
        graduationYear: row.graduation_year,
        experienceYears: row.experience_years || 0,
        currentPosition: row.current_position,
        currentCompany: row.current_company,
        skills: row.skills && row.skills !== 'null' ? JSON.parse(row.skills) : undefined,
        linkedinUrl: row.linkedin_url,
        portfolioUrl: row.portfolio_url,
        resumeUrl: row.resume_url,
        coverLetter: row.cover_letter,
        status: row.status,
        source: row.source,
        applicationsCount: parseInt(row.applications_count || 0),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      const countResult = await db.queryRow<{ total: number }>`
        SELECT COUNT(*) as total FROM candidates
      `;

      return {
        candidates,
        total: countResult?.total || 0,
      };
    } catch (error) {
      console.error('Error in listCandidates:', error);
      throw new Error('Failed to fetch candidates');
    }
  }
);