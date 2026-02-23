import z from 'zod';

const orderItemSchema = z.object({
  productId: z.uuidv4(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

export const placeOrderDtoSchema = z.object({
  customerId: z.uuidv4(),
  items: z.array(orderItemSchema),
});
