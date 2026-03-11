import z from 'zod';

export const deliverOrderDtoSchema = z.object({
  orderId: z.uuidv4(),
  deliveredAt: z.iso.datetime(),
});
