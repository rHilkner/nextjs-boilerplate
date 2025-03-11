import { z } from 'zod';

export const userProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    role: z.enum(['user', 'admin', 'editor'], {
        errorMap: () => ({ message: 'Please select a valid role' }),
    }),
    department: z.string().min(1, 'Please select a department'),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    notify: z.boolean().default(false),
    acceptTerms: z.boolean()
        .refine(val => val, {
            message: 'You must accept the terms and conditions',
        }),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;