# Pix MCP Server v2.1.0

A lightweight Model Context Protocol (MCP) server that enables AI agents (Claude, Cursor, Windsurf) to generate static Pix QR codes via natural-language prompts.

## 🚀 Features

- **🔧 MCP Tool**:
  - `generateStaticPix` - Generate static Pix QR codes for any Pix key (no API required)
- **🚀 Production-ready**: Comprehensive error handling and logging
- **🔒 Type-safe**: Full TypeScript implementation with Zod validation
- **📱 QR Code generation**: Automatic QR code creation for Pix payments
- **📦 Zero Dependencies**: No external API keys or services required
- **🌍 Open & Accessible**: Works without any registration or credentials
- **✅ EMV 4.0 Compliant**: Follows BACEN PIX standards with proper CRC16-CCITT validation

## 🚀 Quick Start

```bash
# Install globally
npm install -g pix-mcp

# Run in MCP mode (for Claude Desktop)
pix-mcp

# Run in HTTP mode (for web services)
MCP_MODE=http pix-mcp
```

## 🔧 Usage

### MCP Mode (Default)

```bash
# Start in MCP mode for Claude Desktop integration
pix-mcp
```

### HTTP Mode

```bash
# Start in HTTP mode on port 3000
MCP_MODE=http pix-mcp
```

### Making Requests

#### HTTP API

```bash
curl -X POST http://localhost:3000/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "generateStaticPix",
    "arguments": {
      "pixKey": "10891990909",
      "amount": 100.50,
      "recipientName": "Franco Camelo Aguzzi",
      "recipientCity": "Florianopolis"
    }
  }'
```

#### MCP Tool

```typescript
const result = await mcpClient.callTool('generateStaticPix', {
  pixKey: '10891990909',
  amount: 100.5,
  recipientName: 'Franco Camelo Aguzzi',
  recipientCity: 'Florianopolis',
});
```

## 🚀 Deployment

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2FRegenerating-World%2Fpix-mcp)

**⚠️ Important:** After deploying to Railway, add these environment variables in the Railway dashboard:

- `MCP_MODE=http`
- `NODE_ENV=production` (optional)

### Manual Deployment

```bash
# Clone the repository
git clone https://github.com/Regenerating-World/pix-mcp.git
cd pix-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Start the server in HTTP mode
MCP_MODE=http NODE_ENV=production node dist/index.js
```

## 📝 License

MIT

## 🔧 Configuration

### Environment Variables

- `MCP_MODE`: Server mode (`stdio` for MCP, `http` for HTTP API) - Default: `stdio`
- `NODE_ENV`: Environment (`development`/`production`) - Default: `development`
- `PORT`: HTTP port when in HTTP mode - Default: `3000`

## 🤖 Usage with Claude Desktop

### MCP Configuration

```json
// Add to your Claude Desktop MCP configuration
{
  "mcpServers": {
    "pix-mcp": {
      "command": "npx",
      "args": ["pix-mcp"],
      "env": {
        "MCP_MODE": "stdio"
      }
    }
  }
}
```

Then in Claude:

```
Create a Pix charge for R$25.50 to Maria Silva for lunch
```

## 🔨 Available Tools

### `generateStaticPix`

Creates a static Pix payment QR code following BACEN EMV 4.0 standards.

**Parameters:**

- `pixKey` (string): Valid Pix key (email, phone, CPF, CNPJ, or random key)
- `amount` (number): Payment amount in BRL (0.01 to 999,999.99)
- `recipientName` (string): Name of the payment recipient (max 25 chars)
- `recipientCity` (string): City of the payment recipient (max 15 chars)

**Returns:**

- Payment details (amount, recipient, city)
- Pix copy-paste code (EMV format)
- QR code image (base64 data URL)
- Success status and message

**Supported Pix Key Types:**

- 📧 Email: `example@email.com`
- 📱 Phone: `+5511999999999`
- 👤 CPF: `12345678901` (11 digits)
- 🏢 CNPJ: `12345678000195` (14 digits)
- 🔑 Random Key: `123e4567-e89b-12d3-a456-426614174000` (UUID format)

## 🏗️ Development

```bash
# Development mode with hot reload
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## 🗺️ Roadmap

### Phase 1: MVP ✅

- [x] `generateStaticPix` tool
- [x] Static Pix QR code generation
- [x] QR code generation
- [x] Claude Desktop compatibility
- [x] EMV 4.0 compliance
- [x] CRC16-CCITT validation
- [x] All Pix key types support
- [x] Public deployment

### Phase 2: MCP Discovery

- [ ] Register with MCP registry

## 🔒 Security & Validation

- ✅ EMV 4.0 standard compliance
- ✅ CRC16-CCITT checksum validation
- ✅ Input validation with Zod schemas
- ✅ Pix key format validation
- ✅ Comprehensive error handling
- ✅ Type-safe TypeScript implementation

## ⚠️ Important Notes

- **CPF/CNPJ Keys**: Must be valid and registered as Pix keys
- **Test Data**: Avoid using fake CPFs like `12345678900` - they will be rejected by banks
- **Static Codes**: No expiration, recipient must check payments manually
- **Validation**: All codes are EMV-compliant and pass bank validation

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- GitHub Issues: [Report bugs or request features](https://github.com/Regenerating-World/pix-mcp/issues)
- Documentation: Available in this README

---

Made with ❤️ for the Brazilian Pix ecosystem
