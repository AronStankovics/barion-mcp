# Barion MCP Server

A Model Context Protocol (MCP) server for integrating Barion payment and wallet services with AI assistants and development tools.

## Features

This MCP server provides tools to interact with the Barion API:



## Prerequisites

* Node js 18 or newer
* Barion credentials:
   - **POSKey** for payment operations (get from [Shops](https://secure.barion.com/Shop))
   - **API Key** for wallet operations (get from [Wallet -> Access](https://secure.barion.com/Access))
* VS Code, Cursor, Windsurf, Claude Desktop, Goose or any other MCP client


## Getting Started
First, install the Barion MCP server with your client.

Standard config works in most of the tools:

```js
{
  "mcpServers": {
    "barion": {
      "command": "npx",
      "args": [
        "@barion/mcp@latest"
      ]
    }
  }
}
```

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

For development and contributing, see [DEVELOPMENT.md](DEVELOPMENT.md).


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Resources

- [Barion API Documentation](https://docs.barion.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
