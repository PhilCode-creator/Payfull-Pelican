import { ZodSchema } from "zod";

// Generic validator
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): { valid: true; data: T } | { valid: false; error: any } {
  try {
    return { valid: true, data: schema.parse(data) };
  } catch (err: any) {
    return { valid: false, error: err.errors };
  }
}
