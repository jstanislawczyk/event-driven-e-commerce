import type { Request, Response } from 'express';
import { placeOrderDtoSchema } from '../dtos/place-order.dto.ts';
import { randomUUID } from 'node:crypto';
import type { PlaceOrderHandler } from '../../../application/command-handlers/place-order.handler.ts';

export class OrderController {
  constructor(private readonly placeOrderHandler: PlaceOrderHandler) {}

  async create(request: Request, response: Response) {
    const parsedBody = placeOrderDtoSchema.safeParse(request.body);
    const orderId = randomUUID();

    if (!parsedBody.success) {
      return response.status(400).json({
        error: 'Validation failed',
        details: parsedBody.error.issues,
      });
    }

    try {
      await this.placeOrderHandler.execute({
        orderId,
        customerId: parsedBody.data.customerId,
        items: parsedBody.data.items,
      });

      return response.status(201).json({
        orderId,
        status: 'AWAITING_PAYMENT',
      });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
}
