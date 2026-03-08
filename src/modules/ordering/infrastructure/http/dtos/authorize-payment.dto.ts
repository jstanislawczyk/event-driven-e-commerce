import z from 'zod';

export const authorizePaymentDtoSchema = z.object({
  orderId: z.uuidv4(),
  paymentId: z.uuidv4(),
  authorizedAt: z.iso.datetime(),
});
