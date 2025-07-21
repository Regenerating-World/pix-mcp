# Pix MCP Server

A lightweight Model Context Protocol (MCP) server that enables AI agents (Claude, Cursor, Windsurf) to generate static Pix QR codes via natural-language prompts.

## 🚀 Features

- **🔧 MCP Tool**:
  - `generateStaticPix` - Generate static Pix QR codes for any Pix key (no API required)
- **🚀 Production-ready**: Comprehensive error handling and logging
- **🔒 Type-safe**: Full TypeScript implementation with Zod validation
- **📱 QR Code generation**: Automatic QR code creation for Pix payments
- **📦 Zero Dependencies**: No external API keys or services required
- **🌍 Open & Accessible**: Works without any registration or credentials

## 🚀 Quick Start

```bash
# Install globally
npm install -g pix-mcp-server

# Run the server
pix-mcp-server --http --http-port 3000
```

## 🔧 Usage

### MCP Mode

```bash
# Start in MCP mode (default)
pix-mcp-server
```

### HTTP Mode

```bash
# Start in HTTP mode
pix-mcp-server --http --http-port 3000
```

### Making Requests

#### HTTP API

```bash
curl -X POST http://localhost:3000/generate-static-pix \
  -H "Content-Type: application/json" \
  -d '{
    "pixKey": "12345678900",
    "amount": 100.50,
    "recipientName": "John Doe",
    "recipientCity": "Sao Paulo",
    "description": "Payment for services"
  }'
```

#### MCP Tool

```typescript
const result = await mcpClient.callTool('generateStaticPix', {
  pixKey: '12345678900',
  amount: 100.50,
  recipientName: 'John Doe',
  recipientCity: 'Sao Paulo',
  description: 'Payment for services'
});
```

## 🚀 Deployment

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2FRegenerating-World%2Fpix-mcp)

### Manual Deployment

```bash
# Clone the repository
git clone https://github.com/Regenerating-World/pix-mcp.git
cd pix-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
NODE_ENV=production node dist/index.js --http --http-port $PORT
```

## 📝 License

MIT

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
