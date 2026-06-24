export type ValidationResult = string | null;

export function required(value: string, field = "This field"): ValidationResult {
  return value.trim().length > 0 ? null : `${field} is required`;
}

export function email(value: string): ValidationResult {
  if (!value.trim()) return "Email is required";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? null
    : "Enter a valid email address";
}

export function password(value: string): ValidationResult {
  if (!value) return "Password is required";
  return value.length >= 8 ? null : "Password must be at least 8 characters";
}

export function minLength(
  value: string,
  length: number,
  field = "This field"
): ValidationResult {
  return value.length >= length
    ? null
    : `${field} must be at least ${length} characters`;
}

export function maxLength(
  value: string,
  length: number,
  field = "This field"
): ValidationResult {
  return value.length <= length
    ? null
    : `${field} must be ${length} characters or fewer`;
}

export function firstError(...results: ValidationResult[]): ValidationResult {
  return results.find((result) => result !== null) || null;
}
