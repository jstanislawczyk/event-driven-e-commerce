import type { Request, Response } from 'express';
import { placeOrderDtoSchema } from '../dtos/place-order.dto.ts';
import { randomUUID } from 'node:crypto';
import type { PlaceOrderHandler } from '../../../application/command-handlers/place-order.handler.ts';
import type { PlaceOrderCommand } from '../../../application/commands/place-order.command.ts';

export class OrderController {
  constructor(private readonly placeOrderHandler: PlaceOrderHandler) {}

  async create(request: Request, response: Response) {
    const parsedBody = placeOrderDtoSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return response.status(400).json({
        error: 'Validation failed',
        details: parsedBody.error.issues,
      });
    }

    const placeOrderCommand: PlaceOrderCommand = {
      orderId: randomUUID(),
      customerId: parsedBody.data.customerId,
      items: parsedBody.data.items,
    };

    try {
      await this.placeOrderHandler.execute(placeOrderCommand);

      return response.status(201).json({
        orderId: placeOrderCommand.orderId,
        status: 'AWAITING_PAYMENT',
      });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
}
