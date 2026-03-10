import type { Request, Response } from 'express';
import { placeOrderDtoSchema } from '../dtos/place-order.dto.ts';
import { randomUUID } from 'node:crypto';
import type { PlaceOrderHandler } from '../../../application/command-handlers/place-order.handler.ts';
import type { PlaceOrderCommand } from '../../../application/commands/place-order.command.ts';
import { authorizePaymentDtoSchema } from '../dtos/authorize-payment.dto.ts';
import type { AuthorizePaymentHandler } from '../../../application/command-handlers/authorize-payment.handler.ts';
import type { AuthorizePaymentCommand } from '../../../application/commands/authorize-payment.command.ts';
import type { RejectPaymentCommand } from '../../../application/commands/reject-payment.command.ts';
import type { RejectPaymentHandler } from '../../../application/command-handlers/reject-payment.handler.ts';
import { rejectPaymentDtoSchema } from '../dtos/reject-payment.dto.ts';

export class OrderController {
  constructor(
    private readonly placeOrderHandler: PlaceOrderHandler,
    private readonly authorizePaymentHandler: AuthorizePaymentHandler,
    private readonly rejectPaymentHandler: RejectPaymentHandler,
  ) {}

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

  async authorizePayment(request: Request, response: Response) {
    const requestOrderId = request.params.orderId;

    if (!requestOrderId) {
      return response.status(400).json({ error: 'Order ID is required' });
    }

    const parsedBody = authorizePaymentDtoSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return response.status(400).json({
        error: 'Validation failed',
        details: parsedBody.error.issues,
      });
    }

    if (parsedBody.data.orderId !== requestOrderId) {
      return response
        .status(400)
        .json({ error: 'Order ID in body does not match URL parameter' });
    }

    const { orderId, paymentId, authorizedAt } = parsedBody.data;
    const authorizePaymentCommand: AuthorizePaymentCommand = {
      orderId,
      paymentId,
      authorizedAt: new Date(authorizedAt),
    };

    try {
      await this.authorizePaymentHandler.execute(authorizePaymentCommand);

      return response.status(201).json({
        orderId: authorizePaymentCommand.orderId,
        status: 'PAYMENT_AUTHORIZED',
      });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }

  async rejectPayment(request: Request, response: Response) {
    const requestOrderId = request.params.orderId;

    if (!requestOrderId) {
      return response.status(400).json({ error: 'Order ID is required' });
    }

    const parsedBody = rejectPaymentDtoSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return response.status(400).json({
        error: 'Validation failed',
        details: parsedBody.error.issues,
      });
    }

    if (parsedBody.data.orderId !== requestOrderId) {
      return response
        .status(400)
        .json({ error: 'Order ID in body does not match URL parameter' });
    }

    const { orderId, paymentId } = parsedBody.data;
    const rejectPaymentCommand: RejectPaymentCommand = {
      orderId,
      paymentId,
    };

    try {
      await this.rejectPaymentHandler.execute(rejectPaymentCommand);

      return response.status(201).json({
        orderId: rejectPaymentCommand.orderId,
        status: 'PAYMENT_REJECTED',
      });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
}
