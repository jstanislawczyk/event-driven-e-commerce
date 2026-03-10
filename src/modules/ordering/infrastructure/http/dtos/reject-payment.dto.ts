import z from 'zod';

export const rejectPaymentDtoSchema = z.object({
  orderId: z.uuidv4(),
  paymentId: z.uuidv4(),
});
