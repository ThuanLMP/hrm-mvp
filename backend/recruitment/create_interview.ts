import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { CreateInterviewRequest, Interview } from "./types";
import { verifySimpleToken } from "../auth/tokenUtils";

interface CreateInterviewRequestWithAuth extends CreateInterviewRequest {
  authorization: Header<"Authorization">;
}

export const createInterview = api<CreateInterviewRequestWithAuth, Interview>(
  { expose: true, method: "POST", path: "/recruitment/interviews" },
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
    
    if (user.role !== 'admin' && user.role !== 'hr' && user.role !== 'manager') {
      throw APIError.permissionDenied("Only admins, HR, and managers can schedule interviews");
    }

    const { authorization, ...interviewData } = req;

    // Verify application exists
    const application = await db.queryRow`
      SELECT id FROM job_applications WHERE id = ${interviewData.applicationId}
    `;
    if (!application) {
      throw APIError.notFound("Job application not found");
    }

    // Get interviewer names if IDs provided
    let interviewerNames: string[] | undefined;
    if (interviewData.interviewerIds && interviewData.interviewerIds.length > 0) {
      const interviewers = await db.queryAll<{ full_name: string }>`
        SELECT full_name FROM employees WHERE id = ANY(${interviewData.interviewerIds})
      `;
      interviewerNames = interviewers.map(emp => emp.full_name);
    }

    const interview = await db.queryRow<any>`
      INSERT INTO interviews (
        application_id, interview_type, interview_date, duration_minutes,
        location, meeting_link, interviewer_ids, interviewer_names, notes, created_by
      )
      VALUES (
        ${interviewData.applicationId}, ${interviewData.interviewType}, 
        ${interviewData.interviewDate.toISOString()}, ${interviewData.durationMinutes || 60},
        ${interviewData.location}, ${interviewData.meetingLink},
        ${interviewData.interviewerIds ? JSON.stringify(interviewData.interviewerIds) : null},
        ${interviewerNames ? JSON.stringify(interviewerNames) : null},
        ${interviewData.notes}, ${parseInt(user.userID)}
      )
      RETURNING 
        id, application_id, interview_type, interview_date, duration_minutes,
        location, meeting_link, interviewer_ids, interviewer_names, status,
        notes, feedback, rating, result, next_steps, created_by, created_at, updated_at
    `;

    if (!interview) {
      throw APIError.internal("Failed to create interview");
    }

    // Get related data
    const applicationData = await db.queryRow<any>`
      SELECT 
        CONCAT(c.first_name, ' ', c.last_name) as candidate_name,
        j.title as job_title
      FROM job_applications app
      LEFT JOIN candidates c ON app.candidate_id = c.id
      LEFT JOIN job_postings j ON app.job_posting_id = j.id
      WHERE app.id = ${interview.application_id}
    `;

    const creatorData = await db.queryRow`
      SELECT full_name FROM employees WHERE id = ${interview.created_by}
    `;

    return {
      id: interview.id,
      applicationId: interview.application_id,
      candidateName: applicationData?.candidate_name,
      jobTitle: applicationData?.job_title,
      interviewType: interview.interview_type,
      interviewDate: interview.interview_date,
      durationMinutes: interview.duration_minutes,
      location: interview.location,
      meetingLink: interview.meeting_link,
      interviewerIds: interview.interviewer_ids && interview.interviewer_ids !== 'null' ? JSON.parse(interview.interviewer_ids) : undefined,
      interviewerNames: interview.interviewer_names && interview.interviewer_names !== 'null' ? JSON.parse(interview.interviewer_names) : undefined,
      status: interview.status,
      notes: interview.notes,
      feedback: interview.feedback,
      rating: interview.rating,
      result: interview.result,
      nextSteps: interview.next_steps,
      createdBy: interview.created_by,
      createdByName: creatorData?.full_name,
      evaluationsCount: 0,
      createdAt: interview.created_at,
      updatedAt: interview.updated_at,
    };
  }
);