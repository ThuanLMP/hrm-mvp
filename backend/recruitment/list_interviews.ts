import { api, Query } from "encore.dev/api";
import db from "../db";
import { ListInterviewsResponse, Interview } from "./types";

interface ListInterviewsRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  applicationId?: Query<number>;
  status?: Query<string>;
  interviewType?: Query<string>;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

export const listInterviews = api<ListInterviewsRequest, ListInterviewsResponse>(
  { expose: true, method: "GET", path: "/recruitment/interviews" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    try {
      // Use simple query without complex filtering for now
      const rawInterviews = await db.queryAll<any>`
        SELECT 
          i.id, i.application_id, i.interview_type, i.interview_date, i.duration_minutes,
          i.location, i.meeting_link, i.interviewer_ids, i.interviewer_names,
          i.status, i.notes, i.feedback, i.rating, i.result, i.next_steps,
          i.created_by, i.created_at, i.updated_at,
          CONCAT(c.first_name, ' ', c.last_name) as candidate_name,
          j.title as job_title,
          creator.full_name as created_by_name,
          COUNT(DISTINCT eval.id) as evaluations_count
        FROM interviews i
        LEFT JOIN job_applications app ON i.application_id = app.id
        LEFT JOIN candidates c ON app.candidate_id = c.id
        LEFT JOIN job_postings j ON app.job_posting_id = j.id
        LEFT JOIN employees creator ON i.created_by = creator.id
        LEFT JOIN interview_evaluations eval ON i.id = eval.interview_id
        GROUP BY i.id, c.first_name, c.last_name, j.title, creator.full_name
        ORDER BY i.interview_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const interviews = rawInterviews.map(row => ({
        id: row.id,
        applicationId: row.application_id,
        candidateName: row.candidate_name,
        jobTitle: row.job_title,
        interviewType: row.interview_type,
        interviewDate: row.interview_date,
        durationMinutes: row.duration_minutes,
        location: row.location,
        meetingLink: row.meeting_link,
        interviewerIds: row.interviewer_ids && row.interviewer_ids !== 'null' ? JSON.parse(row.interviewer_ids) : undefined,
        interviewerNames: row.interviewer_names && row.interviewer_names !== 'null' ? JSON.parse(row.interviewer_names) : undefined,
        status: row.status,
        notes: row.notes,
        feedback: row.feedback,
        rating: row.rating,
        result: row.result,
        nextSteps: row.next_steps,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        evaluationsCount: parseInt(row.evaluations_count || 0),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      const countResult = await db.queryRow<{ total: number }>`
        SELECT COUNT(*) as total FROM interviews
      `;

      return {
        interviews,
        total: countResult?.total || 0,
      };
    } catch (error) {
      console.error('Error in listInterviews:', error);
      throw new Error('Failed to fetch interviews');
    }
  }
);