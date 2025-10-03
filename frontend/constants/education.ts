// Education level constants
export const EDUCATION_LEVELS = {
  high_school: "Cấp 3",
  college: "Cao đẳng",
  university: "Đại học",
  master: "Thạc sĩ",
  phd: "Tiến sĩ",
} as const;

export type EducationLevel = keyof typeof EDUCATION_LEVELS;

// Training system constants
export const TRAINING_SYSTEMS = {
  formal: "Hệ chính quy",
  non_formal: "Hệ không chính quy",
} as const;

export type TrainingSystem = keyof typeof TRAINING_SYSTEMS;

// Degree classification constants
export const DEGREE_CLASSIFICATIONS = {
  average: "Trung bình",
  good: "Khá",
  excellent: "Giỏi",
  outstanding: "Xuất sắc",
} as const;

export type DegreeClassification = keyof typeof DEGREE_CLASSIFICATIONS;
