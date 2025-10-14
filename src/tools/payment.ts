import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BarionClient } from '../utils/barion-client.js';

export function configurePaymentTools(server: McpServer, poskey: string, environment: 'test' | 'prod' = 'test') {
  const client = new BarionClient(poskey, environment);

  // Tool: Start Payment
  server.tool(
    'start_payment',
    'Start a new Barion payment',
    {
      paymentType: z.enum(['Immediate', 'Reservation', 'DelayedCapture']).describe('The type of payment'),
      currency: z.string().describe('Currency code (e.g., HUF, EUR, USD)'),
      transactions: z.array(
        z.object({
          posTransactionId: z.string().describe('Unique ID for this transaction'),
          payee: z.string().describe('Email address of the payee'),
          total: z.number().describe('Total amount'),
          items: z.array(
            z.object({
              name: z.string().describe('Item name'),
              description: z.string().describe('Item description'),
              quantity: z.number().describe('Quantity'),
              unit: z.string().describe('Unit (e.g., piece, hour)'),
              unitPrice: z.number().describe('Unit price'),
              itemTotal: z.number().describe('Total price for this item'),
            })
          ),
        })
      ).describe('Array of transactions'),
      redirectUrl: z.string().describe('URL to redirect after payment'),
      callbackUrl: z.string().describe('URL for payment callback'),
    },
    async (args) => {
      try {
        const result = await client.startPayment(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error starting payment: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Get Payment State
  server.tool(
    'get_payment_state',
    'Get the current state of a payment',
    {
      paymentId: z.string().describe('The Barion payment ID'),
    },
    async (args) => {
      try {
        const result = await client.getPaymentState(args.paymentId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error getting payment state: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Finish Reservation
  server.tool(
    'finish_reservation',
    'Finish (capture) a reserved payment',
    {
      paymentId: z.string().describe('The Barion payment ID'),
      transactions: z.array(
        z.object({
          transactionId: z.string().describe('The transaction ID'),
          total: z.number().describe('Amount to capture'),
        })
      ).describe('Array of transactions to finish'),
    },
    async (args) => {
      try {
        const result = await client.finishReservation(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error finishing reservation: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Refund Payment
  server.tool(
    'refund_payment',
    'Refund a completed payment',
    {
      paymentId: z.string().describe('The Barion payment ID'),
      transactionId: z.string().describe('The transaction ID to refund'),
      amount: z.number().describe('Amount to refund'),
      comment: z.string().optional().describe('Optional comment for the refund'),
    },
    async (args) => {
      try {
        const result = await client.refundPayment(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error refunding payment: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
