import z from 'zod';

export const shipOrderDtoSchema = z.object({
  orderId: z.uuidv4(),
  shippedAt: z.iso.datetime(),
});
