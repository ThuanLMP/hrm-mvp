import { api } from "encore.dev/api";
import db from "../db";
import {
  ListCoursesRequest,
  ListCoursesResponse,
  TrainingCourse,
} from "./types";

export const listCourses = api<ListCoursesRequest, ListCoursesResponse>(
  { expose: true, method: "GET", path: "/training/courses" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let courses: TrainingCourse[];
    let countResult: { total: number } | null;

    if (
      req.categoryId ||
      req.status ||
      req.courseType ||
      req.search ||
      req.startDate ||
      req.endDate
    ) {
      // Apply filters
      let baseQuery = `
        SELECT 
          c.id, c.title, c.description, c.category_id, c.instructor,
          c.duration_hours, c.max_participants, c.start_date, c.end_date,
          c.location, c.course_type, c.status, CAST(c.cost AS TEXT) as cost, c.image_url,
          c.created_by, c.created_at, c.updated_at,
          cat.name as category_name,
          creator.full_name as created_by_name,
          COUNT(DISTINCT e.id) as enrolled_count,
          COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_count
        FROM training_courses c
        LEFT JOIN training_categories cat ON c.category_id = cat.id
        LEFT JOIN employees creator ON c.created_by = creator.id
        LEFT JOIN training_enrollments e ON c.id = e.course_id
        WHERE 1=1
      `;

      let countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM training_courses c
        LEFT JOIN training_categories cat ON c.category_id = cat.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (req.categoryId) {
        baseQuery += ` AND c.category_id = $${paramIndex}`;
        countQuery += ` AND c.category_id = $${paramIndex}`;
        params.push(req.categoryId);
        paramIndex++;
      }

      if (req.status) {
        baseQuery += ` AND c.status = $${paramIndex}`;
        countQuery += ` AND c.status = $${paramIndex}`;
        params.push(req.status);
        paramIndex++;
      }

      if (req.courseType) {
        baseQuery += ` AND c.course_type = $${paramIndex}`;
        countQuery += ` AND c.course_type = $${paramIndex}`;
        params.push(req.courseType);
        paramIndex++;
      }

      if (req.search) {
        baseQuery += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex} OR c.instructor ILIKE $${paramIndex})`;
        countQuery += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex} OR c.instructor ILIKE $${paramIndex})`;
        params.push(`%${req.search}%`);
        paramIndex++;
      }

      if (req.startDate) {
        baseQuery += ` AND c.start_date >= $${paramIndex}`;
        countQuery += ` AND c.start_date >= $${paramIndex}`;
        params.push(req.startDate.toISOString().split("T")[0]);
        paramIndex++;
      }

      if (req.endDate) {
        baseQuery += ` AND c.end_date <= $${paramIndex}`;
        countQuery += ` AND c.end_date <= $${paramIndex}`;
        params.push(req.endDate.toISOString().split("T")[0]);
        paramIndex++;
      }

      baseQuery += ` GROUP BY c.id, cat.name, creator.full_name ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${
        paramIndex + 1
      }`;
      params.push(limit, offset);

      const rawCourses = await db.rawQueryAll<any>(baseQuery, ...params);
      courses = rawCourses.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        categoryId: row.category_id,
        categoryName: row.category_name,
        instructor: row.instructor,
        durationHours: row.duration_hours,
        maxParticipants: row.max_participants,
        startDate: row.start_date,
        endDate: row.end_date,
        location: row.location,
        courseType: row.course_type,
        status: row.status,
        cost: row.cost ? parseFloat(row.cost) : undefined,
        imageUrl: row.image_url,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        enrolledCount: parseInt(row.enrolled_count || 0),
        completedCount: parseInt(row.completed_count || 0),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      countResult = await db.rawQueryRow<{ total: number }>(
        countQuery,
        ...params.slice(0, -2)
      );
    } else {
      // No filters
      const rawCourses = await db.queryAll<any>`
        SELECT 
          c.id, c.title, c.description, c.category_id, c.instructor,
          c.duration_hours, c.max_participants, c.start_date, c.end_date,
          c.location, c.course_type, c.status, CAST(c.cost AS TEXT) as cost, c.image_url,
          c.created_by, c.created_at, c.updated_at,
          cat.name as category_name,
          creator.full_name as created_by_name,
          COUNT(DISTINCT e.id) as enrolled_count,
          COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_count
        FROM training_courses c
        LEFT JOIN training_categories cat ON c.category_id = cat.id
        LEFT JOIN employees creator ON c.created_by = creator.id
        LEFT JOIN training_enrollments e ON c.id = e.course_id
        GROUP BY c.id, cat.name, creator.full_name
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      courses = rawCourses.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        categoryId: row.category_id,
        categoryName: row.category_name,
        instructor: row.instructor,
        durationHours: row.duration_hours,
        maxParticipants: row.max_participants,
        startDate: row.start_date,
        endDate: row.end_date,
        location: row.location,
        courseType: row.course_type,
        status: row.status,
        cost: row.cost ? parseFloat(row.cost) : undefined,
        imageUrl: row.image_url,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        enrolledCount: parseInt(row.enrolled_count || 0),
        completedCount: parseInt(row.completed_count || 0),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      countResult = await db.queryRow<{ total: number }>`
        SELECT COUNT(*) as total FROM training_courses
      `;
    }

    return {
      courses,
      total: countResult?.total || 0,
    };
  }
);
