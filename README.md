# Pix MCP Server

A production-grade Model Context Protocol (MCP) server that enables AI agents (Claude, Cursor, Windsurf) to generate and manage Pix payments via natural-language prompts.

## 🚀 Features

- **Phase 1 (MVP)**: `createPixCharge` tool with Efí provider
- **Multi-provider support**: Built-in fallback system (Phase 2)
- **Production-ready**: Comprehensive error handling and logging
- **Type-safe**: Full TypeScript implementation with Zod validation
- **QR Code generation**: Automatic QR code creation for Pix payments
- **Health monitoring**: Built-in health check and validation tools
- **NPM distribution**: Easy installation via npm package manager

## 🔧 Installation

### Option 1: NPM Installation (Recommended)

```bash
# Install globally
npm install -g pix-mcp-server

# Verify installation
pix-mcp --version
```

### Option 2: Local Installation

```bash
# Install in your project
npm install pix-mcp-server

# Run locally
npx pix-mcp-server
```

### Option 3: From Source

```bash
# Clone the repository
git clone https://github.com/Regenerating-World/pix-mcp.git
cd pix-mcp

# Install and setup
npm run setup
```

## 🔧 Configuration

### Environment Variables

- `EFI_CLIENT_ID`: Your Efí (Gerencianet) client ID
- `EFI_CLIENT_SECRET`: Your Efí client secret
- `EFI_SANDBOX`: Set to `true` for sandbox mode, `false` for production
- `EFI_PIX_KEY`: Your Pix key (email, phone, CPF, or random key)

### Getting Efí Credentials

1. Create an account at [Efí (Gerencianet)](https://sejaefi.com.br/)
2. Access the developer dashboard
3. Create a new application to get your client ID and secret
4. Configure your Pix key in the Efí dashboard

## 🤖 Usage with Claude Desktop

### Method 1: Direct Tool Usage (Phase 1)

```json
// Add to your Claude Desktop MCP configuration
{
  "mcpServers": {
    "pix-mcp": {
      "command": "node",
      "args": ["/path/to/pix-mcp-server/dist/index.js"],
      "env": {
        "EFI_CLIENT_ID": "your_client_id",
        "EFI_CLIENT_SECRET": "your_client_secret",
        "EFI_SANDBOX": "true"
      }
    }
  }
}
```

Then in Claude:
```
Create a Pix charge for R$25.50 to Maria Silva for lunch
```

### Method 2: Remote Tool Usage (Future)

```
Use tools from https://pixmcp.com/
Create a Pix charge for R$15 to João for coffee
```

## 🔨 Available Tools

### `createPixCharge`

Creates a new Pix payment charge with QR code.

**Parameters:**
- `amount` (number): Payment amount in BRL (0.01 to 999,999.99)
- `recipientName` (string): Name of the payment recipient (1-100 chars)
- `description` (string, optional): Payment description (max 200 chars)

**Returns:**
- Transaction ID (txid)
- Pix copy-paste code
- QR code image (base64 data URL)
- Expiration timestamp
- Payment details

**Example:**
```typescript
{
  "amount": 25.50,
  "recipientName": "Maria Silva",
  "description": "Lunch payment"
}
```

## 🏗️ Development

```bash
# Development mode with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] `createPixCharge` tool
- [x] Efí provider integration
- [x] QR code generation
- [x] Claude Desktop compatibility

### Phase 2: Stability (In Progress)
- [ ] Cielo provider integration
- [ ] Adyen provider integration
- [ ] Automatic fallback logic
- [ ] Enhanced logging and monitoring

### Phase 3: MCP Discovery
- [ ] Register with MCP registry
- [ ] Public deployment at pixmcp.com
- [ ] Documentation and examples

### Phase 4: Tool Expansion
- [ ] `getPixStatus` tool
- [ ] `cancelPixCharge` tool
- [ ] Webhook listener for payment confirmation

## 🔒 Security

- Environment variables for sensitive credentials
- Token caching with automatic refresh
- Input validation with Zod schemas
- Comprehensive error handling
- Sandbox mode for testing

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- GitHub Issues: [Report bugs or request features](https://github.com/your-org/pix-mcp-server/issues)
- Documentation: [Full API documentation](https://pixmcp.com/docs)
- Email: support@pixmcp.com

---

Made with ❤️ for the Brazilian Pix ecosystem
