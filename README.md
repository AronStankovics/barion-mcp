# Barion MCP Server

A Model Context Protocol (MCP) server for integrating Barion payment and wallet services with AI assistants and development tools.

## Features

This MCP server provides tools to interact with the Barion API:

### Payment Tools (requires POSKey)
- **start_payment**: Start a new payment transaction
- **get_payment_state**: Get the current state of a payment
- **finish_reservation**: Finish (capture) a reserved payment
- **refund_payment**: Refund a completed payment

### Wallet Tools (requires API Key)
- **get_wallet_accounts**: Get all wallet accounts
- **get_wallet_balance**: Get wallet balance
- **get_bank_accounts**: Get registered bank accounts
- **get_wallet_statement**: Get transaction history
- **withdraw_to_bank**: Withdraw funds to bank account
- **get_user_info**: Get user information
- **send_money**: Send money to another Barion user

## Prerequisites

- Node.js 20 or higher
- A Barion account ([Sign up here](https://secure.barion.com/))
- **POSKey** for payment operations (for merchants)
- **API Key** for wallet operations (for wallet access)

## Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd barion-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Set up your Barion credentials:
```bash
cp .env.example .env
# Edit .env and add your credentials:
# - BARION_POSKEY for payment operations
# - BARION_API_KEY for wallet operations
```

## Usage

### Running the Server

You can run the server in several ways:

1. **With both credentials (payment + wallet):**
```bash
BARION_POSKEY=your_poskey BARION_API_KEY=your_apikey npm start
```

2. **With only POSKey (payment operations only):**
```bash
BARION_POSKEY=your_poskey npm start
```

3. **With only API Key (wallet operations only):**
```bash
BARION_API_KEY=your_apikey npm start
```

4. **With command line arguments:**
```bash
node dist/index.js --poskey your_poskey --api-key your_apikey
```

5. **Using the MCP Inspector (for testing):**
```bash
npm run inspect
```

### VS Code Integration

To use this MCP server with VS Code and GitHub Copilot:

1. Copy the [.vscode/mcp.json](.vscode/mcp.json) configuration
2. Update the credentials (`BARION_POSKEY` and/or `BARION_API_KEY`) in the configuration
3. Restart VS Code
4. The Barion tools will be available to GitHub Copilot

### Example Usage

Once connected, you can use natural language commands like:

**Payment operations:**
- "Start a new Barion payment for 100 HUF"
- "Check the status of payment ID abc123"
- "Refund 50 EUR from transaction xyz789"

**Wallet operations:**
- "Show my Barion wallet balance"
- "Get my wallet statement for January 2025"
- "Send 100 HUF to user@example.com"
- "Withdraw 500 EUR to my bank account"

## Development

### Project Structure

```
barion-mcp/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools.ts              # Tool configuration
│   ├── tools/
│   │   ├── payment.ts        # Payment-related tools
│   │   └── wallet.ts         # Wallet-related tools
│   └── utils/
│       ├── barion-client.ts  # Barion Payment API client
│       └── wallet-client.ts  # Barion Wallet API client
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

### Formatting

```bash
npm run format
```

### Cleaning

```bash
npm run clean
```

## Architecture

- **Modular tool organization**: Tools are organized by domain (payment, etc.)
- **Type-safe schemas**: Uses Zod for runtime validation and type safety
- **Stdio transport**: Uses standard input/output for communication
- **Environment-based configuration**: Supports both test and production environments

## API Reference

### Payment Tools (POSKey Authentication)

#### start_payment

Start a new Barion payment transaction.

**Parameters:**
- `paymentType`: Type of payment (Immediate, Reservation, DelayedCapture)
- `currency`: Currency code (HUF, EUR, USD, etc.)
- `transactions`: Array of transaction objects
- `redirectUrl`: URL to redirect after payment
- `callbackUrl`: URL for payment callbacks

#### get_payment_state

Get the current state of a payment.

**Parameters:**
- `paymentId`: The Barion payment ID

#### finish_reservation

Finish (capture) a reserved payment.

**Parameters:**
- `paymentId`: The Barion payment ID
- `transactions`: Array of transactions to finish

#### refund_payment

Refund a completed payment.

**Parameters:**
- `paymentId`: The Barion payment ID
- `transactionId`: The transaction ID to refund
- `amount`: Amount to refund
- `comment`: Optional comment for the refund

### Wallet Tools (API Key Authentication)

#### get_wallet_accounts

Get all wallet accounts.

**Parameters:** None

#### get_wallet_balance

Get wallet balance for a specific currency or all currencies.

**Parameters:**
- `currency`: Currency code (optional)

#### get_bank_accounts

Get registered bank accounts.

**Parameters:**
- `currency`: Currency code to filter by (optional)

#### get_wallet_statement

Get wallet statement (transaction history) for a specific month.

**Parameters:**
- `year`: Year (e.g., 2025)
- `month`: Month (1-12)
- `currency`: Currency code (optional)

#### withdraw_to_bank
\\&
Withdraw funds from wallet to a registered bank account.

**Parameters:**
- `currency`: Currency code
- `amount`: Amount to withdraw
- `bankAccountId`: ID of the registered bank account
- `comment`: Optional comment

#### get_user_info

Get user information from Barion wallet.

**Parameters:** None

#### send_money

Send money to another Barion user by email address.

**Parameters:**
- `recipientEmail`: Email address of the recipient
- `currency`: Currency code
- `amount`: Amount to send
- `comment`: Optional comment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Resources

- [Barion API Documentation](https://docs.barion.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
