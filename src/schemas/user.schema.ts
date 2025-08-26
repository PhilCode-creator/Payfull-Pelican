import z from "zod";

export const createUserSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    email: z.email().transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    adress: z.string().min(1, "Address is required").optional(),
  })
  .strict();

export const userIdParamSchema = z.string().regex(/^[0-9a-f]{24}$/);
