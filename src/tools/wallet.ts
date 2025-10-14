import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WalletClient } from '../utils/wallet-client.js';

export function configureWalletTools(server: McpServer, apiKey: string, environment: 'test' | 'prod' = 'test') {
  const client = new WalletClient(apiKey, environment);

  // Tool: Get Accounts
  server.tool(
    'get_wallet_accounts',
    'Get all wallet accounts',
    async () => {
      try {
        const result = await client.getAccounts();
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
              text: `Error getting wallet accounts: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Get Balance
  server.tool(
    'get_wallet_balance',
    'Get wallet balance for a specific currency or all currencies',
    {
      currency: z.string().optional().describe('Currency code (e.g., HUF, EUR, USD). Optional.'),
    },
    async (args) => {
      try {
        const result = await client.getBalance(args.currency);
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
              text: `Error getting wallet balance: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Get Bank Accounts
  server.tool(
    'get_bank_accounts',
    'Get registered bank accounts',
    {
      currency: z.string().optional().describe('Currency code to filter by (e.g., HUF, EUR, USD). Optional.'),
    },
    async (args) => {
      try {
        const result = await client.getBankAccounts(args.currency);
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
              text: `Error getting bank accounts: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Get Statement
  server.tool(
    'get_wallet_statement',
    'Get wallet statement (transaction history) for a specific month',
    {
      year: z.number().describe('Year (e.g., 2025)'),
      month: z.number().min(1).max(12).describe('Month (1-12)'),
      currency: z.string().optional().describe('Currency code (e.g., HUF, EUR, USD). Optional.'),
    },
    async (args) => {
      try {
        const result = await client.getStatement({
          year: args.year,
          month: args.month,
          currency: args.currency,
        });
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
              text: `Error getting wallet statement: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Withdraw
  server.tool(
    'withdraw_to_bank',
    'Withdraw funds from wallet to a registered bank account',
    {
      currency: z.string().describe('Currency code (e.g., HUF, EUR, USD)'),
      amount: z.number().positive().describe('Amount to withdraw'),
      bankAccountId: z.string().describe('ID of the registered bank account'),
      comment: z.string().optional().describe('Optional comment for the withdrawal'),
    },
    async (args) => {
      try {
        const result = await client.withdraw({
          currency: args.currency,
          amount: args.amount,
          bankAccountId: args.bankAccountId,
          comment: args.comment,
        });
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
              text: `Error withdrawing to bank: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Get User Info
  server.tool(
    'get_user_info',
    'Get user information from Barion wallet',
    async () => {
      try {
        const result = await client.getUserInfo();
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
              text: `Error getting user info: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Send Money
  server.tool(
    'send_money',
    'Send money to another Barion user by email address. If recipient is not registered, they have 7 days to claim.',
    {
      recipientEmail: z.string().email().describe('Email address of the recipient'),
      currency: z.string().describe('Currency code (CZK, EUR, HUF, USD)'),
      amount: z.number().positive().describe('Amount to send'),
      comment: z.string().optional().describe('Optional comment for the transfer (max 1000 characters)'),
      sourceAccountId: z.string().optional().describe('Optional: Source account ID. If not provided, uses first account with matching currency'),
    },
    async (args) => {
      try {
        const result = await client.sendMoney({
          recipientEmail: args.recipientEmail,
          currency: args.currency,
          amount: args.amount,
          comment: args.comment,
          sourceAccountId: args.sourceAccountId,
        });
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
              text: `Error sending money: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
