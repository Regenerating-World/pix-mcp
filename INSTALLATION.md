# Pix MCP Server - Installation Guide

## 📦 Installation Options

### Option 1: NPM Global Installation (Recommended)

```bash
# Install globally via npm
npm install -g pix-mcp-server

# Verify installation
pix-mcp --version
```

### Option 2: Local Project Installation

```bash
# Install in your project
npm install pix-mcp-server

# Run locally
npx pix-mcp-server
```

### Option 3: From Source

```bash
# Clone repository
git clone https://github.com/your-org/pix-mcp-server.git
cd pix-mcp-server

# Install dependencies
npm install

# Build project
npm run build

# Start server
npm start
```

## 🔧 Configuration

### 1. Environment Setup

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Efí (Gerencianet) Configuration
EFI_CLIENT_ID=your_efi_client_id
EFI_CLIENT_SECRET=your_efi_client_secret
EFI_SANDBOX=true

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. Getting Efí Credentials

1. **Create Account**: Visit [Efí (Gerencianet)](https://sejaefi.com.br/)
2. **Access Dashboard**: Go to developer section
3. **Create Application**: Generate API credentials
4. **Get Credentials**: Copy Client ID and Client Secret
5. **Configure Pix**: Set up your Pix key in the dashboard

### 3. Claude Desktop Integration

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pix-mcp": {
      "command": "pix-mcp",
      "env": {
        "EFI_CLIENT_ID": "your_efi_client_id_here",
        "EFI_CLIENT_SECRET": "your_efi_client_secret_here",
        "EFI_SANDBOX": "true"
      }
    }
  }
}
```

### 4. Validation

Test your setup:

```bash
# Check health status
echo '{"method": "tools/call", "params": {"name": "healthCheck", "arguments": {}}}' | pix-mcp
```

## 🚀 Quick Start

### 1. Basic Usage in Claude

Once configured, you can use natural language prompts:

```
"Create a Pix charge for R$ 50.00 for João Silva with description 'Coffee payment'"
```

### 2. Available Tools

- **`createPixCharge`**: Generate Pix payment with QR code
- **`healthCheck`**: Verify server status and configuration

### 3. Example Responses

**Successful Payment Creation:**
```
✅ Pix charge created successfully!

Payment Details:
- Amount: R$ 50.00
- Recipient: João Silva
- Description: Coffee payment
- Transaction ID: abc123...
- Expires: 25/07/2024 18:30:00

Pix Code: 00020126580014br.gov.bcb.pix...
QR Code: [Generated QR Code Image]
```

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use different credentials for sandbox/production
- Rotate API keys regularly

### Production Deployment
- Set `EFI_SANDBOX=false` for production
- Use secure environment variable management
- Monitor API usage and limits

## 🐳 Docker Deployment

```bash
# Build image
docker build -t pix-mcp-server .

# Run container
docker run -d \
  --name pix-mcp \
  -e EFI_CLIENT_ID=your_client_id \
  -e EFI_CLIENT_SECRET=your_client_secret \
  -e EFI_SANDBOX=true \
  pix-mcp-server
```

## 🔧 Troubleshooting

### Common Issues

**1. Missing Environment Variables**
```
Error: Missing required environment variables: EFI_CLIENT_ID, EFI_CLIENT_SECRET
```
**Solution**: Ensure all required environment variables are set

**2. Invalid Credentials**
```
Error: Authentication failed
```
**Solution**: Verify your Efí credentials and sandbox/production settings

**3. Claude Desktop Not Detecting Server**
```
MCP server not found
```
**Solution**: Check configuration file path and JSON syntax

### Debug Mode

Enable verbose logging:

```bash
DEBUG=pix-mcp:* pix-mcp
```

### Health Check

Verify server status:

```bash
# Using curl (if HTTP endpoint available)
curl http://localhost:3000/health

# Using MCP protocol
echo '{"method": "tools/call", "params": {"name": "healthCheck"}}' | pix-mcp
```

## 📞 Support

- **Documentation**: [GitHub Repository](https://github.com/your-org/pix-mcp-server)
- **Issues**: [GitHub Issues](https://github.com/your-org/pix-mcp-server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/pix-mcp-server/discussions)

## 🔄 Updates

Keep your installation up to date:

```bash
# Global installation
npm update -g pix-mcp-server

# Local installation
npm update pix-mcp-server
```

Check for updates:

```bash
npm outdated -g pix-mcp-server
```
