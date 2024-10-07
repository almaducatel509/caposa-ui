import { useState } from 'react';
import { z } from 'zod';

// Define the validation schema for holidays
export const holidaySchema = z.object({
    holyday_date: z.string().min(1, "La date est requise").date(),
    holyday_description:z.string().min(6,"date description is required"),

});

// Specific interface for holidays
export interface Holiday extends z.infer<typeof holidaySchema> {}

// Generic type for handling error messages
export type ErrorMessages<T> = Partial<Record<keyof T, string>>;

