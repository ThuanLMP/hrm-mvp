import { api, APIError, Header } from "encore.dev/api";
import { verifySimpleToken } from "../auth/tokenUtils";
import { toDecimalText } from "../bonus/create";
import db from "../db";
import { CreateCourseRequest, TrainingCourse } from "./types";

interface CreateCourseRequestWithAuth extends CreateCourseRequest {
  authorization: Header<"Authorization">;
}

export const createCourse = api<CreateCourseRequestWithAuth, TrainingCourse>(
  { expose: true, method: "POST", path: "/training/courses" },
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

    if (user.role !== "admin" && user.role !== "hr") {
      throw APIError.permissionDenied(
        "Only admins and HR can create training courses"
      );
    }

    const { authorization, ...courseData } = req;

    // Verify category exists if provided
    if (courseData.categoryId) {
      const category = await db.queryRow`
        SELECT id FROM training_categories WHERE id = ${courseData.categoryId} AND is_active = true
      `;
      if (!category) {
        throw APIError.notFound("Training category not found");
      }
    }
    const totalCostText = toDecimalText(courseData.cost);

    const course = await db.queryRow<any>`
      INSERT INTO training_courses (
        title, description, category_id, instructor, duration_hours, max_participants,
        start_date, end_date, location, course_type, cost, image_url, created_by
      )
      VALUES (
        ${courseData.title}, ${courseData.description}, ${
      courseData.categoryId
    },
        ${courseData.instructor}, ${courseData.durationHours}, ${
      courseData.maxParticipants
    },
        ${
          courseData.startDate
            ? courseData.startDate.toISOString().split("T")[0]
            : null
        },
        ${
          courseData.endDate
            ? courseData.endDate.toISOString().split("T")[0]
            : null
        },
        ${courseData.location}, ${courseData.courseType}, 
           to_number(${totalCostText}, 'FM999999999.00'), ${
      courseData.imageUrl
    }, ${parseInt(user.userID)}
      )
      RETURNING 
        id, title, description, category_id, instructor, duration_hours, max_participants,
        start_date, end_date, location, course_type, status, CAST(cost AS TEXT) as cost, image_url,
        created_by, created_at, updated_at
    `;

    if (!course) {
      throw APIError.internal("Failed to create training course");
    }

    // Get related data
    const categoryData = courseData.categoryId
      ? await db.queryRow`
      SELECT name FROM training_categories WHERE id = ${course.category_id}
    `
      : null;

    const creatorData = await db.queryRow`
      SELECT full_name FROM employees WHERE id = ${course.created_by}
    `;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      categoryId: course.category_id,
      categoryName: categoryData?.name,
      instructor: course.instructor,
      durationHours: course.duration_hours,
      maxParticipants: course.max_participants,
      startDate: course.start_date,
      endDate: course.end_date,
      location: course.location,
      courseType: course.course_type,
      status: course.status,
      cost: course.cost ? parseFloat(course.cost) : undefined,
      imageUrl: course.image_url,
      createdBy: course.created_by,
      createdByName: creatorData?.full_name,
      enrolledCount: 0,
      completedCount: 0,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    };
  }
);
