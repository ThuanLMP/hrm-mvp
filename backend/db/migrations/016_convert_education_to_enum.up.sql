-- Convert education_level from text to enum values
UPDATE employees 
SET education_level = CASE 
  WHEN education_level = 'Cấp 3' THEN 'high_school'
  WHEN education_level = 'Cao đẳng' THEN 'college'
  WHEN education_level = 'Đại học' THEN 'university'
  WHEN education_level = 'Thạc sĩ' THEN 'master'
  WHEN education_level = 'Tiến sĩ' THEN 'phd'
  ELSE education_level
END
WHERE education_level IS NOT NULL;

-- Convert training_system from text to enum values
UPDATE employees 
SET training_system = CASE 
  WHEN training_system = 'Hệ chính quy' THEN 'formal'
  WHEN training_system = 'Hệ không chính quy' THEN 'non_formal'
  ELSE training_system
END
WHERE training_system IS NOT NULL;

-- Convert degree_classification from text to enum values
UPDATE employees 
SET degree_classification = CASE 
  WHEN degree_classification = 'Trung bình' THEN 'average'
  WHEN degree_classification = 'Khá' THEN 'good'
  WHEN degree_classification = 'Giỏi' THEN 'excellent'
  WHEN degree_classification = 'Xuất sắc' THEN 'outstanding'
  ELSE degree_classification
END
WHERE degree_classification IS NOT NULL;
