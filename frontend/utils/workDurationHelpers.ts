/**
 * Calculate work duration from hire date to termination date (or current date if still working)
 */
export function calculateWorkDuration(
  hireDate: string | Date,
  terminationDate?: string | Date | null
): string {
  const start = new Date(hireDate);
  const end = terminationDate ? new Date(terminationDate) : new Date();

  // Calculate difference in milliseconds
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate years, months, and days
  const years = Math.floor(diffDays / 365);
  const remainingDaysAfterYears = diffDays % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;

  // Format the result
  const parts = [];
  if (years > 0) {
    parts.push(`${years} năm`);
  }
  if (months > 0) {
    parts.push(`${months} tháng`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days} ngày`);
  }

  return parts.join(" ");
}

/**
 * Get work status text based on termination date
 */
export function getWorkStatus(terminationDate?: string | Date | null): string {
  if (terminationDate) {
    return "Đã nghỉ việc";
  }
  return "Đang làm việc";
}

/**
 * Format date for display
 */
export function formatDisplayDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("vi-VN");
}
