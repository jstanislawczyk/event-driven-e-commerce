import z from 'zod';

export const pageParamsDtoSchema = z.object({
  page: z.coerce.number().min(0).default(0),
  pageSize: z.coerce
    .number()
    .min(1, 'Page size must be at least 1')
    .max(100)
    .default(100),
});
