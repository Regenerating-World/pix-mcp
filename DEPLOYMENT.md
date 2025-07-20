# Deployment Guide - Pix MCP Server

## 🌐 Hosted MCP Server

Your Pix MCP server now supports **HTTP mode** for hosted deployment, allowing the community to use it without local installation.

## 🚀 Deployment Options

### Option 1: Railway (Recommended)

**Why Railway?**
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Built-in environment variable management
- ✅ Easy scaling

**Steps:**
1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Select `Regenerating-World/pix-mcp` repository

2. **Configure Environment Variables**:
   ```
   MCP_MODE=http
   NODE_ENV=production
   EFI_CLIENT_ID=your_efi_client_id
   EFI_CLIENT_SECRET=your_efi_client_secret
   EFI_SANDBOX=true
   PORT=3000
   ```

3. **Deploy**:
   - Railway will automatically build and deploy
   - Your server will be available at: `https://your-app.railway.app`

### Option 2: Render

**Steps:**
1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Create new Web Service from GitHub
   - Select `Regenerating-World/pix-mcp`

2. **Configuration** (auto-detected from `render.yaml`):
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables in dashboard

3. **Environment Variables**:
   ```
   MCP_MODE=http
   NODE_ENV=production
   EFI_CLIENT_ID=your_efi_client_id
   EFI_CLIENT_SECRET=your_efi_client_secret
   EFI_SANDBOX=true
   ```

### Option 3: Vercel

**Steps:**
1. **Deploy**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Environment Variables** (via Vercel dashboard):
   ```
   MCP_MODE=http
   NODE_ENV=production
   EFI_CLIENT_ID=your_efi_client_id
   EFI_CLIENT_SECRET=your_efi_client_secret
   EFI_SANDBOX=true
   ```

### Option 4: Docker + Any Cloud

**Build and Deploy**:
```bash
# Build image
docker build -t pix-mcp .

# Run locally
docker run -p 3000:3000 \
  -e MCP_MODE=http \
  -e EFI_CLIENT_ID=your_client_id \
  -e EFI_CLIENT_SECRET=your_client_secret \
  -e EFI_SANDBOX=true \
  pix-mcp

# Deploy to any cloud provider
```

## 🔗 Community Usage

### For End Users

Once deployed, users can connect to your hosted server:

**Claude Desktop Configuration:**
```json
{
  "mcpServers": {
    "pix-mcp-hosted": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "https://your-deployed-url.com/tools/call",
        "-H", "Content-Type: application/json",
        "-d"
      ],
      "env": {}
    }
  }
}
```

**Direct API Usage:**
```bash
# List available tools
curl https://your-deployed-url.com/tools

# Create Pix charge
curl -X POST https://your-deployed-url.com/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "createPixCharge",
    "arguments": {
      "amount": 50.00,
      "recipientName": "João Silva",
      "description": "Coffee payment"
    }
  }'

# Health check
curl https://your-deployed-url.com/health
```

## 🔒 Security Considerations

### Environment Variables
- **Never expose your Efí credentials** in public repositories
- Use your hosting platform's environment variable system
- Consider using **your own credentials** for the hosted service

### Rate Limiting
Consider adding rate limiting for production:

```typescript
// Add to your HTTP server
const rateLimit = new Map();

// In request handler
const clientIP = req.connection.remoteAddress;
const now = Date.now();
const windowMs = 60000; // 1 minute
const maxRequests = 10;

if (!rateLimit.has(clientIP)) {
  rateLimit.set(clientIP, { count: 1, resetTime: now + windowMs });
} else {
  const limit = rateLimit.get(clientIP);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + windowMs;
  } else if (limit.count >= maxRequests) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
    return;
  } else {
    limit.count++;
  }
}
```

### Authentication (Optional)
For production, consider adding API key authentication:

```typescript
// Add to request handler
const apiKey = req.headers['x-api-key'];
if (!apiKey || apiKey !== process.env.API_KEY) {
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Unauthorized' }));
  return;
}
```

## 📊 Monitoring

### Health Checks
All platforms can use the built-in health endpoint:
- **URL**: `/health`
- **Method**: GET
- **Response**: JSON with server status

### Logging
Monitor your deployment logs for:
- Request patterns
- Error rates
- Performance metrics
- Efí API usage

### Metrics to Track
- **Requests per minute**
- **Success/failure rates**
- **Response times**
- **Pix charge creation volume**

## 🔄 Updates

### Automatic Deployments
Most platforms support automatic deployments:

1. **Push to main branch**
2. **Platform detects changes**
3. **Automatic build and deploy**
4. **Zero downtime updates**

### Manual Updates
```bash
# Update package version
npm version patch

# Push changes
git push origin main

# Platform will auto-deploy
```

## 🌍 Going Live

### Production Checklist
- [ ] **Environment**: Set `EFI_SANDBOX=false`
- [ ] **Credentials**: Use production Efí credentials
- [ ] **Domain**: Configure custom domain (optional)
- [ ] **SSL**: Ensure HTTPS is enabled
- [ ] **Monitoring**: Set up alerts and logging
- [ ] **Rate limiting**: Implement if needed
- [ ] **Documentation**: Update API documentation with your URL

### Community Announcement
Once deployed, you can announce your hosted service:

**Example:**
```markdown
🎉 **Pix MCP Server is now hosted!**

**API Endpoint**: https://pix-mcp.your-domain.com
**Health Check**: https://pix-mcp.your-domain.com/health
**Available Tools**: https://pix-mcp.your-domain.com/tools

**Usage:**
- No local installation required
- Direct API access
- Compatible with Claude Desktop and other MCP clients
- Free for community use

**Documentation**: https://github.com/Regenerating-World/pix-mcp
```

## 💡 Advanced Features

### Multi-tenant Support
For serving multiple users with different credentials:

```typescript
// Add user-specific credential handling
const getUserCredentials = (userId: string) => {
  // Implement user credential lookup
  return {
    clientId: process.env[`EFI_CLIENT_ID_${userId}`],
    clientSecret: process.env[`EFI_CLIENT_SECRET_${userId}`]
  };
};
```

### Webhook Support
Add webhook endpoints for payment notifications:

```typescript
// Add to HTTP server
if (url.pathname === '/webhooks/pix' && req.method === 'POST') {
  // Handle Efí webhook notifications
  // Update payment status, notify users, etc.
}
```

### Analytics Dashboard
Create a simple dashboard to show:
- Total Pix charges created
- Success rates
- Popular payment amounts
- Usage statistics

Your Pix MCP server is now ready for community deployment! 🚀
