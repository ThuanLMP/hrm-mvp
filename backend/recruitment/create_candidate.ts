import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { CreateCandidateRequest, Candidate } from "./types";
import { verifySimpleToken } from "../auth/tokenUtils";

interface CreateCandidateRequestWithAuth extends CreateCandidateRequest {
  authorization: Header<"Authorization">;
}

export const createCandidate = api<CreateCandidateRequestWithAuth, Candidate>(
  { expose: true, method: "POST", path: "/recruitment/candidates" },
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
      throw APIError.permissionDenied("Only admins and HR can create candidates");
    }

    const { authorization, ...candidateData } = req;

    // Check if email already exists
    const existingCandidate = await db.queryRow`
      SELECT id FROM candidates WHERE email = ${candidateData.email}
    `;
    if (existingCandidate) {
      throw APIError.alreadyExists("Candidate with this email already exists");
    }

    const candidate = await db.queryRow<any>`
      INSERT INTO candidates (
        first_name, last_name, email, phone, address, date_of_birth, gender,
        education_level, university, major, graduation_year, experience_years,
        current_position, current_company, skills, linkedin_url, portfolio_url,
        resume_url, cover_letter, source
      )
      VALUES (
        ${candidateData.firstName}, ${candidateData.lastName}, ${candidateData.email},
        ${candidateData.phone}, ${candidateData.address}, 
        ${candidateData.dateOfBirth ? candidateData.dateOfBirth.toISOString().split('T')[0] : null},
        ${candidateData.gender}, ${candidateData.educationLevel}, ${candidateData.university},
        ${candidateData.major}, ${candidateData.graduationYear}, ${candidateData.experienceYears || 0},
        ${candidateData.currentPosition}, ${candidateData.currentCompany},
        ${candidateData.skills ? JSON.stringify(candidateData.skills) : null},
        ${candidateData.linkedinUrl}, ${candidateData.portfolioUrl}, ${candidateData.resumeUrl},
        ${candidateData.coverLetter}, ${candidateData.source || 'website'}
      )
      RETURNING 
        id, first_name, last_name, email, phone, address, date_of_birth, gender,
        education_level, university, major, graduation_year, experience_years,
        current_position, current_company, skills, linkedin_url, portfolio_url,
        resume_url, cover_letter, status, source, created_at, updated_at
    `;

    if (!candidate) {
      throw APIError.internal("Failed to create candidate");
    }

    return {
      id: candidate.id,
      firstName: candidate.first_name,
      lastName: candidate.last_name,
      fullName: `${candidate.first_name} ${candidate.last_name}`,
      email: candidate.email,
      phone: candidate.phone,
      address: candidate.address,
      dateOfBirth: candidate.date_of_birth,
      gender: candidate.gender,
      educationLevel: candidate.education_level,
      university: candidate.university,
      major: candidate.major,
      graduationYear: candidate.graduation_year,
      experienceYears: candidate.experience_years || 0,
      currentPosition: candidate.current_position,
      currentCompany: candidate.current_company,
      skills: candidate.skills && candidate.skills !== 'null' ? JSON.parse(candidate.skills) : undefined,
      linkedinUrl: candidate.linkedin_url,
      portfolioUrl: candidate.portfolio_url,
      resumeUrl: candidate.resume_url,
      coverLetter: candidate.cover_letter,
      status: candidate.status,
      source: candidate.source,
      applicationsCount: 0,
      createdAt: candidate.created_at,
      updatedAt: candidate.updated_at,
    };
  }
);