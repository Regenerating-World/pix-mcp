# Pix MCP Server - API Reference

## Overview

The Pix MCP Server provides Model Context Protocol (MCP) tools for creating and managing Pix payments in Brazil. This document describes the available tools, their parameters, and expected responses.

## Available Tools

### 1. createPixCharge

Creates a new Pix payment charge with QR code generation.

#### Parameters

| Parameter | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| `amount` | number | Yes | Payment amount in BRL (Brazilian Reais) | 0.01 - 999,999.99 |
| `recipientName` | string | Yes | Name of the payment recipient | 1-100 characters |
| `description` | string | No | Optional payment description | Max 200 characters |

#### Example Request

```json
{
  "method": "tools/call",
  "params": {
    "name": "createPixCharge",
    "arguments": {
      "amount": 50.00,
      "recipientName": "João Silva",
      "description": "Coffee payment"
    }
  }
}
```

#### Success Response

```json
{
  "content": [
    {
      "type": "text",
      "text": "✅ Pix charge created successfully!\n\n**Payment Details:**\n- Amount: R$ 50.00\n- Recipient: João Silva\n- Description: Coffee payment\n- Transaction ID: abc123def456\n- Expires: 25/07/2024 18:30:00\n\n**Pix Code (copy and paste):**\n`00020126580014br.gov.bcb.pix0136example-pix-key@email.com5204000053039865802BR5913João Silva6009SAO PAULO62070503***6304ABCD`\n\n**QR Code:**\n![QR Code](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)\n\nThe recipient can scan the QR code or copy the Pix code to complete the payment."
    }
  ]
}
```

#### Error Response

```json
{
  "content": [
    {
      "type": "text",
      "text": "❌ Error: Invalid amount. Must be between 0.01 and 999999.99"
    }
  ],
  "isError": true
}
```

### 2. healthCheck

Checks the health status of the Pix MCP server and connected providers.

#### Parameters

No parameters required.

#### Example Request

```json
{
  "method": "tools/call",
  "params": {
    "name": "healthCheck",
    "arguments": {}
  }
}
```

#### Success Response

```json
{
  "content": [
    {
      "type": "text",
      "text": "🟢 **Pix MCP Server Health Check**\n\n**Status:** healthy\n**Version:** 1.0.0\n**Environment:** sandbox\n**Providers:** Efí (Gerencianet)\n**Timestamp:** 2024-07-25T15:30:00.000Z\n\n✅ All systems operational"
    }
  ]
}
```

## Response Format

All responses follow the MCP protocol format with a `content` array containing text objects.

### Success Response Structure

```json
{
  "content": [
    {
      "type": "text",
      "text": "Response message with formatted content"
    }
  ]
}
```

### Error Response Structure

```json
{
  "content": [
    {
      "type": "text", 
      "text": "❌ Error: Description of what went wrong"
    }
  ],
  "isError": true
}
```

## Error Handling

The server implements comprehensive error handling for various scenarios:

### Validation Errors

- **Invalid amount**: Amount must be between 0.01 and 999,999.99 BRL
- **Invalid recipient name**: Must be 1-100 characters long
- **Invalid description**: Must not exceed 200 characters

### Provider Errors

- **Authentication failure**: Invalid Efí credentials
- **API rate limiting**: Too many requests to provider
- **Network errors**: Connection issues with payment provider
- **Service unavailable**: Provider maintenance or downtime

### System Errors

- **Missing configuration**: Required environment variables not set
- **Internal server error**: Unexpected system failures

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EFI_CLIENT_ID` | Efí (Gerencianet) client ID | `Client_Id_abc123...` |
| `EFI_CLIENT_SECRET` | Efí client secret | `Client_Secret_xyz789...` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `EFI_SANDBOX` | Use sandbox environment | `true` | `false` |
| `PORT` | Server port (if HTTP mode) | `3000` | `8080` |
| `NODE_ENV` | Node environment | `development` | `production` |

## Pix Code Format

The generated Pix codes follow the Brazilian Central Bank EMV standard:

```
00020126580014br.gov.bcb.pix0136[PIX_KEY]5204000053039865802BR5913[RECIPIENT_NAME]6009[CITY]62070503***6304[CRC]
```

### Components

- **00020126**: Payload format indicator
- **580014br.gov.bcb.pix**: Merchant account information
- **0136[PIX_KEY]**: Pix key (36 characters)
- **5204000053039865802BR**: Transaction currency and country
- **5913[RECIPIENT_NAME]**: Merchant name
- **6009[CITY]**: Merchant city
- **62070503***: Additional data field
- **6304[CRC]**: CRC16 checksum

## QR Code Generation

QR codes are automatically generated for all Pix charges using the following specifications:

- **Format**: PNG image
- **Encoding**: Base64 data URL
- **Error correction**: Medium (M)
- **Size**: 256x256 pixels
- **Content**: EMV-compliant Pix code

## Rate Limiting

The server implements rate limiting to prevent abuse:

- **Default limit**: 100 requests per minute per client
- **Burst limit**: 10 requests per second
- **Provider limits**: Respects individual provider rate limits

## Security Considerations

### API Keys
- Store credentials securely using environment variables
- Never commit credentials to version control
- Use different credentials for sandbox and production
- Rotate keys regularly

### Network Security
- Use HTTPS in production environments
- Implement proper firewall rules
- Monitor for suspicious activity
- Log all transactions for audit purposes

### Data Privacy
- Payment data is not stored by the MCP server
- All data is passed through to the payment provider
- Follow LGPD (Brazilian data protection law) requirements
- Implement proper data retention policies

## Integration Examples

### Claude Desktop

```json
{
  "mcpServers": {
    "pix-mcp": {
      "command": "pix-mcp",
      "env": {
        "EFI_CLIENT_ID": "your_client_id",
        "EFI_CLIENT_SECRET": "your_client_secret",
        "EFI_SANDBOX": "true"
      }
    }
  }
}
```

### Cursor IDE

```json
{
  "mcp": {
    "servers": {
      "pix-mcp": {
        "command": "npx",
        "args": ["pix-mcp-server"],
        "env": {
          "EFI_CLIENT_ID": "your_client_id",
          "EFI_CLIENT_SECRET": "your_client_secret"
        }
      }
    }
  }
}
```

### Windsurf

```json
{
  "mcpServers": {
    "pix-mcp": {
      "command": "node",
      "args": ["./node_modules/pix-mcp-server/dist/index.js"],
      "env": {
        "EFI_CLIENT_ID": "your_client_id",
        "EFI_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

## Monitoring and Logging

### Health Checks

Regular health checks can be performed using the `healthCheck` tool:

```bash
# Manual health check
echo '{"method": "tools/call", "params": {"name": "healthCheck"}}' | pix-mcp
```

### Logging

The server logs important events:

- Tool invocations
- Provider failures and fallbacks
- Authentication errors
- Rate limiting events

### Metrics

Key metrics to monitor:

- Request success/failure rates
- Response times
- Provider availability
- Error frequencies

## Troubleshooting

### Common Issues

1. **Server not starting**
   - Check environment variables
   - Verify Node.js version (>=18.0.0)
   - Run `npm run validate`

2. **Authentication errors**
   - Verify Efí credentials
   - Check sandbox/production settings
   - Ensure credentials are active

3. **QR code generation fails**
   - Check network connectivity
   - Verify QR code library installation
   - Monitor memory usage

### Debug Mode

Enable debug logging:

```bash
DEBUG=pix-mcp:* pix-mcp
```

### Support

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check latest documentation
- **Community**: Join discussions and get help
