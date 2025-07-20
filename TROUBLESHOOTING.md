# Troubleshooting Guide - Pix MCP Server

## Quick Diagnostics

### 1. Run Health Check
```bash
npm run validate
```

### 2. Check Server Status
```bash
echo '{"method": "tools/call", "params": {"name": "healthCheck"}}' | pix-mcp
```

### 3. Enable Debug Mode
```bash
DEBUG=pix-mcp:* pix-mcp
```

## Common Issues

### Installation Problems

#### ❌ "Command not found: pix-mcp"

**Symptoms:**
```bash
pix-mcp: command not found
```

**Solutions:**
1. **Global installation missing:**
   ```bash
   npm install -g pix-mcp-server
   ```

2. **PATH issues:**
   ```bash
   # Check npm global path
   npm config get prefix
   
   # Add to PATH (add to ~/.bashrc or ~/.zshrc)
   export PATH="$(npm config get prefix)/bin:$PATH"
   ```

3. **Use npx instead:**
   ```bash
   npx pix-mcp-server
   ```

#### ❌ "Module not found" errors

**Symptoms:**
```bash
Cannot find module '@modelcontextprotocol/sdk'
```

**Solutions:**
1. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be >= 18.0.0
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

### Configuration Issues

#### ❌ "Missing required environment variables"

**Symptoms:**
```bash
Error: Missing required environment variables: EFI_CLIENT_ID, EFI_CLIENT_SECRET
```

**Solutions:**
1. **Run setup wizard:**
   ```bash
   npm run wizard
   ```

2. **Create .env file manually:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Set environment variables:**
   ```bash
   export EFI_CLIENT_ID="your_client_id"
   export EFI_CLIENT_SECRET="your_client_secret"
   ```

#### ❌ "Authentication failed"

**Symptoms:**
```bash
Error: Authentication failed with Efí provider
```

**Solutions:**
1. **Verify credentials:**
   - Check Client ID and Secret are correct
   - Ensure no extra spaces or characters
   - Verify account is active

2. **Check environment:**
   ```bash
   # For testing, use sandbox
   EFI_SANDBOX=true
   
   # For production
   EFI_SANDBOX=false
   ```

3. **Test credentials manually:**
   - Login to Efí dashboard
   - Regenerate credentials if needed
   - Check API limits and restrictions

### MCP Client Integration

#### ❌ "MCP server not detected"

**Symptoms:**
- Claude Desktop doesn't show Pix tools
- Server not listed in MCP clients

**Solutions:**
1. **Check configuration file location:**
   
   **macOS:**
   ```bash
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```
   
   **Windows:**
   ```bash
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Validate JSON syntax:**
   ```bash
   # Use online JSON validator or:
   python -m json.tool claude_desktop_config.json
   ```

3. **Correct configuration format:**
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

4. **Restart MCP client:**
   - Close Claude Desktop completely
   - Wait 10 seconds
   - Restart application

#### ❌ "Server connection timeout"

**Symptoms:**
```bash
MCP server connection timed out
```

**Solutions:**
1. **Check server executable:**
   ```bash
   which pix-mcp
   # Should return path to executable
   ```

2. **Test server manually:**
   ```bash
   pix-mcp
   # Should start without errors
   ```

3. **Check permissions:**
   ```bash
   chmod +x $(which pix-mcp)
   ```

### Runtime Errors

#### ❌ "QR Code generation failed"

**Symptoms:**
- Pix charge created but no QR code
- QR code shows as broken image

**Solutions:**
1. **Check dependencies:**
   ```bash
   npm list qrcode
   ```

2. **Reinstall QR code library:**
   ```bash
   npm uninstall qrcode
   npm install qrcode
   ```

3. **Memory issues:**
   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 dist/index.js
   ```

#### ❌ "Rate limit exceeded"

**Symptoms:**
```bash
Error: Too many requests. Please try again later.
```

**Solutions:**
1. **Wait and retry:**
   - Efí has rate limits (typically 100/minute)
   - Wait 60 seconds before retrying

2. **Check usage patterns:**
   - Avoid rapid successive calls
   - Implement client-side rate limiting

3. **Contact Efí support:**
   - Request higher rate limits if needed
   - Verify account status

### Performance Issues

#### ⚠️ "Slow response times"

**Symptoms:**
- Tool calls take >10 seconds
- Timeouts in MCP client

**Solutions:**
1. **Check network connectivity:**
   ```bash
   ping api.gerencianet.com.br
   ```

2. **Monitor system resources:**
   ```bash
   # Check CPU and memory usage
   top -p $(pgrep node)
   ```

3. **Enable performance logging:**
   ```bash
   DEBUG=pix-mcp:performance pix-mcp
   ```

#### ⚠️ "Memory leaks"

**Symptoms:**
- Increasing memory usage over time
- System becomes slow

**Solutions:**
1. **Restart server regularly:**
   ```bash
   # Add to crontab for automatic restart
   0 */6 * * * pkill -f pix-mcp && pix-mcp
   ```

2. **Monitor memory usage:**
   ```bash
   # Check memory usage
   ps aux | grep pix-mcp
   ```

3. **Update dependencies:**
   ```bash
   npm update
   ```

## Debug Techniques

### Enable Verbose Logging

```bash
# Full debug output
DEBUG=* pix-mcp

# Specific modules
DEBUG=pix-mcp:* pix-mcp
DEBUG=pix-mcp:provider,pix-mcp:validation pix-mcp
```

### Test Individual Components

```bash
# Test environment validation
npm run validate

# Test build process
npm run build

# Test with minimal config
node -e "console.log(process.env.EFI_CLIENT_ID ? 'OK' : 'Missing')"
```

### Network Debugging

```bash
# Test Efí API connectivity
curl -I https://api.gerencianet.com.br

# Check DNS resolution
nslookup api.gerencianet.com.br

# Test with proxy (if applicable)
HTTP_PROXY=http://proxy:8080 pix-mcp
```

## Log Analysis

### Important Log Patterns

**Successful operations:**
```
✅ Pix charge created successfully
🟢 Health check passed
```

**Authentication issues:**
```
❌ Authentication failed
❌ Invalid credentials
```

**Network problems:**
```
❌ Connection timeout
❌ Network error
```

**Rate limiting:**
```
⚠️ Rate limit approached
❌ Too many requests
```

### Log Locations

- **Console output**: Real-time during execution
- **System logs**: Check system journal/event logs
- **Application logs**: If configured in production

## Getting Help

### Before Asking for Help

1. **Run diagnostics:**
   ```bash
   npm run validate
   ```

2. **Check logs:**
   ```bash
   DEBUG=pix-mcp:* pix-mcp 2>&1 | tee debug.log
   ```

3. **Gather system info:**
   ```bash
   node --version
   npm --version
   uname -a  # Linux/macOS
   systeminfo  # Windows
   ```

### Where to Get Help

1. **GitHub Issues**: https://github.com/your-org/pix-mcp-server/issues
   - Include debug logs
   - Describe steps to reproduce
   - Mention your environment

2. **Documentation**:
   - `README.md` - General overview
   - `INSTALLATION.md` - Setup instructions
   - `API.md` - API reference

3. **Community**:
   - GitHub Discussions
   - Stack Overflow (tag: pix-mcp)

### Issue Template

When reporting issues, include:

```markdown
## Environment
- OS: [e.g., macOS 14.0, Ubuntu 22.04]
- Node.js: [e.g., 18.17.0]
- Package version: [e.g., 1.0.0]
- MCP Client: [e.g., Claude Desktop 1.0]

## Problem Description
[Clear description of the issue]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Debug Logs
```
[Paste debug output here]
```

## Additional Context
[Any other relevant information]
```

## Prevention Tips

### Regular Maintenance

1. **Keep dependencies updated:**
   ```bash
   npm audit
   npm update
   ```

2. **Monitor health regularly:**
   ```bash
   # Add to monitoring system
   npm run validate
   ```

3. **Backup configuration:**
   ```bash
   cp .env .env.backup
   cp claude_desktop_config.json claude_desktop_config.json.backup
   ```

### Best Practices

1. **Use environment-specific configs**
2. **Implement proper error handling**
3. **Monitor API usage and limits**
4. **Keep credentials secure and rotated**
5. **Test in sandbox before production**

### Security Checklist

- [ ] Credentials stored securely
- [ ] No credentials in version control
- [ ] Regular credential rotation
- [ ] Network security configured
- [ ] Monitoring and alerting setup
- [ ] Backup and recovery plan
