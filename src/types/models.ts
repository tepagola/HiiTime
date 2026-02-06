
import { z } from 'zod';

// --- Enums ---

export const ExerciseTypeSchema = z.enum(['timer', 'reps', 'rest']);
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;

// --- Sub-Schemas ---

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  type: ExerciseTypeSchema,
  duration: z.number().nonnegative().optional(), // Seconds. Required for 'timer' and 'rest'
  reps: z.number().int().nonnegative().optional(), // Required for 'reps'
  notes: z.string().optional(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const PlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Plan name is required"),
  exercises: z.array(ExerciseSchema).min(1, "At least one exercise is required"),
  rounds: z.number().int().min(1, "At least one round is required"),
  createdAt: z.number(), // Timestamp
  updatedAt: z.number(), // Timestamp
});
export type Plan = z.infer<typeof PlanSchema>;

// --- Storage Key Constant ---
export const STORAGE_KEY = 'hiitime_current_plan';
