# VS Code Setup Guide

This guide explains how to use the Barion MCP server with Visual Studio Code and GitHub Copilot.

## Prerequisites

1. **Visual Studio Code** 1.99 or later
2. **GitHub Copilot** extension installed and active
3. **Barion MCP server** built (run `npm run build` in this project)
4. Barion credentials:
   - **POSKey** for payment operations (get from [Barion Merchant Portal](https://secure.barion.com/))
   - **API Key** for wallet operations (get from [Barion User Settings](https://secure.barion.com/))

## Quick Start

### Option 1: User Profile Configuration (All Workspaces)

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. Run: `MCP: Open User Configuration`
3. **Add this configuration** (replace `YOUR_USERNAME` with your Windows username):

```json
{
  "servers": {
    "barion": {
      "type": "stdio",
      "command": "node",
      "args": [
        "C:/Users/YOUR_USERNAME/repos/barion-mcp/dist/index.js"
      ],
      "env": {
        "BARION_POSKEY": "your_actual_poskey",
        "BARION_API_KEY": "your_actual_apikey"
      }
    }
  }
}
```

4. **Save the file**
5. **Click "Start"** button at the top of the file, or run `MCP: List Servers` and start Barion

### Option 2: Workspace Configuration (This Project Only)

1. **Edit** `.vscode/mcp.json` in this project
2. **Replace** placeholders with your actual credentials
3. **Save** the file
4. **Click "Start"** button or run `MCP: List Servers`

---

## Detailed Configuration

### Method 1: User Configuration (Recommended)

Makes Barion MCP available in all VS Code workspaces.

#### Using Secure Input Prompts

```json
{
  "servers": {
    "barion": {
      "type": "stdio",
      "command": "node",
      "args": [
        "C:/Users/YOUR_USERNAME/repos/barion-mcp/dist/index.js"
      ],
      "env": {
        "BARION_POSKEY": "${input:barion-poskey}",
        "BARION_API_KEY": "${input:barion-apikey}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "barion-poskey",
      "description": "Barion POSKey",
      "password": true
    },
    {
      "type": "promptString",
      "id": "barion-apikey",
      "description": "Barion API Key",
      "password": true
    }
  ]
}
```

This prompts you for credentials when starting the server (more secure).

### Method 2: Workspace Configuration

Edit `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "barion": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "BARION_POSKEY": "your_poskey",
        "BARION_API_KEY": "your_apikey"
      }
    }
  }
}
```

**Note:** `.vscode/mcp.json` is in `.gitignore` to protect your secrets.

### Method 3: Environment Variables (Most Secure)

1. **Set environment variables** (Windows PowerShell):
```powershell
[System.Environment]::SetEnvironmentVariable('BARION_POSKEY', 'your_poskey', 'User')
[System.Environment]::SetEnvironmentVariable('BARION_API_KEY', 'your_apikey', 'User')
```

2. **Configure MCP** (credentials read automatically):
```json
{
  "servers": {
    "barion": {
      "type": "stdio",
      "command": "node",
      "args": [
        "C:/Users/YOUR_USERNAME/repos/barion-mcp/dist/index.js"
      ]
    }
  }
}
```

3. **Restart VS Code** to reload environment variables

---

## Verification

### Check Server Status

1. Command Palette (`Ctrl+Shift+P`) → `MCP: List Servers`
2. Look for "barion" with green status indicator
3. Check Output panel (`View` → `Output`) → Select "MCP" dropdown
4. Look for: `Barion MCP server started successfully`

### Test with Copilot

Open GitHub Copilot Chat (`Ctrl+Alt+I`) and ask:
```
List available Barion tools
```

You should see:
- **Payment tools** (4): start_payment, get_payment_state, finish_reservation, refund_payment
- **Wallet tools** (7): get_wallet_accounts, get_wallet_balance, get_bank_accounts, get_wallet_statement, withdraw_to_bank, get_user_info, send_money

---

## Usage Examples

### Payment Operations
```
Start a payment for 5000 HUF with redirect to https://myapp.com/return
```

```
Check status of payment abc-123
```

### Wallet Operations
```
Show my wallet balance
```

```
Get statement for January 2025
```

```
Send 100 HUF to friend@example.com
```

---

## Troubleshooting

### Server Won't Start

**Check VS Code version:**
```
Help → About → Version should be 1.99+
```

**Verify Node.js:**
```powershell
node --version  # Should be 20+
```

**Rebuild server:**
```bash
npm run build
```

**Check path:** Ensure path to `dist/index.js` is correct and absolute

### Credentials Not Working

- Verify no extra spaces in credentials
- Payment tools need `BARION_POSKEY`
- Wallet tools need `BARION_API_KEY`
- Use test credentials with test environment (default)

### Tools Not in Copilot

1. Check server is running: `MCP: List Servers`
2. Restart server if needed
3. Reload window: `Ctrl+R`
4. Check Output → MCP for errors

---

## Configuration Examples

### Payment Only
```json
{
  "servers": {
    "barion": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/Users/YOUR_USERNAME/repos/barion-mcp/dist/index.js"],
      "env": {
        "BARION_POSKEY": "your_poskey"
      }
    }
  }
}
```

### Wallet Only
```json
{
  "servers": {
    "barion": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/Users/YOUR_USERNAME/repos/barion-mcp/dist/index.js"],
      "env": {
        "BARION_API_KEY": "your_apikey"
      }
    }
  }
}
```

### Production Environment
```json
{
  "servers": {
    "barion": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/Users/YOUR_USERNAME/repos/barion-mcp/dist/index.js"],
      "env": {
        "BARION_POSKEY": "your_poskey",
        "BARION_API_KEY": "your_apikey",
        "BARION_ENV": "prod"
      }
    }
  }
}
```

---

## Security Best Practices

✅ Use `inputs` with `password: true` for sensitive data
✅ Use environment variables for shared/team configs
✅ Never commit `.vscode/mcp.json` with real credentials
✅ Use test credentials during development
✅ Review tool calls before executing payments/withdrawals

---

## Resources

- [VS Code MCP Docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [Barion API Docs](https://docs.barion.com/)
- [Project README](README.md)
- [Development Guide](DEVELOPMENT.md)
