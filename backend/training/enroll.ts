import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { EnrollEmployeeRequest } from "./types";
import { verifySimpleToken } from "../auth/tokenUtils";

interface EnrollEmployeeRequestWithAuth extends EnrollEmployeeRequest {
  authorization: Header<"Authorization">;
}

interface EnrollResponse {
  success: boolean;
  enrollmentId: number;
}

export const enrollEmployee = api<EnrollEmployeeRequestWithAuth, EnrollResponse>(
  { expose: true, method: "POST", path: "/training/enroll" },
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
      throw APIError.permissionDenied("Only admins, HR, and managers can enroll employees");
    }

    const { authorization, ...enrollData } = req;

    // Verify course exists and has capacity
    const course = await db.queryRow<any>`
      SELECT 
        id, max_participants, status,
        (SELECT COUNT(*) FROM training_enrollments WHERE course_id = ${enrollData.courseId} AND status != 'dropped') as current_enrollments
      FROM training_courses 
      WHERE id = ${enrollData.courseId}
    `;
    
    if (!course) {
      throw APIError.notFound("Training course not found");
    }

    if (course.status === 'completed' || course.status === 'cancelled') {
      throw APIError.failedPrecondition("Cannot enroll in completed or cancelled course");
    }

    if (course.max_participants && course.current_enrollments >= course.max_participants) {
      throw APIError.failedPrecondition("Course is full");
    }

    // Verify employee exists
    const employee = await db.queryRow`
      SELECT id FROM employees WHERE id = ${enrollData.employeeId}
    `;
    if (!employee) {
      throw APIError.notFound("Employee not found");
    }

    // Check if already enrolled
    const existingEnrollment = await db.queryRow`
      SELECT id FROM training_enrollments 
      WHERE course_id = ${enrollData.courseId} AND employee_id = ${enrollData.employeeId}
    `;
    if (existingEnrollment) {
      throw APIError.alreadyExists("Employee is already enrolled in this course");
    }

    const enrollment = await db.queryRow<{ id: number }>`
      INSERT INTO training_enrollments (course_id, employee_id)
      VALUES (${enrollData.courseId}, ${enrollData.employeeId})
      RETURNING id
    `;

    if (!enrollment) {
      throw APIError.internal("Failed to enroll employee");
    }

    return {
      success: true,
      enrollmentId: enrollment.id,
    };
  }
);