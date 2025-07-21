#!/usr/bin/env node

/**
 * Setup Validation Script for Pix MCP Server
 * Validates basic environment configuration for static Pix server
 */

class SetupValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(type, message) {
    const prefix = {
      error: '❌',
      warning: '⚠️ ',
      success: '✅',
      info: 'ℹ️ '
    }[type] || 'ℹ️ ';
    
    console.log(`${prefix} ${message}`);
    
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    if (type === 'success') this.success.push(message);
  }

  async validateEnvironment() {
    this.log('info', 'Validating environment configuration...');
    
    // Check for PORT environment variable
    if (process.env.PORT) {
      this.log('info', `Using custom port: ${process.env.PORT}`);
    } else {
      this.log('info', 'Using default port (3000)');
    }
    
    this.log('success', 'No external dependencies or API keys required');
  }

  async validateNodeVersion() {
    const nodeVersion = process.versions.node;
    const majorVersion = parseInt(nodeVersion.split('.')[0], 10);
    
    if (majorVersion < 16) {
      this.log('error', `Node.js version ${nodeVersion} is not supported. Please use Node.js 16 or higher.`);
    } else {
      this.log('success', `Using Node.js ${nodeVersion}`);
    }
  }

  async run() {
    console.log('\n🔍 Validating Pix MCP Server setup...\n');
    
    await this.validateNodeVersion();
    await this.validateEnvironment();
    
    console.log('\n📊 Validation Summary:');
    console.log(`✅ ${this.success.length} checks passed`);
    
    if (this.warnings.length > 0) {
      console.log(`⚠️  ${this.warnings.length} warnings`);
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log(`❌ ${this.errors.length} errors found`);
      this.errors.forEach(error => console.log(`  - ${error}`));
      process.exit(1);
    }
    
    console.log('\n✨ Setup validation completed successfully!\n');
    return true;
  }
}

// Run the validator
const validator = new SetupValidator();
validator.run().catch(error => {
  console.error('Error during validation:', error);
  process.exit(1);
});

    if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
      this.log('warning', 'PORT should be a valid number');
    }
  }

  async validateDependencies() {
    this.log('info', 'Validating dependencies...');
    
    const packageJsonPath = path.join(__dirname, '../package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      this.log('error', 'package.json not found');
      return;
    }

    try {
      JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      this.log('success', 'package.json is valid');

      // Check if node_modules exists
      const nodeModulesPath = path.join(__dirname, '../node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        this.log('error', 'node_modules not found. Run "npm install"');
      } else {
        this.log('success', 'node_modules found');
      }

      // Check critical dependencies
      const criticalDeps = [
        '@modelcontextprotocol/sdk',
        'axios',
        'dotenv',
        'qrcode',
        'zod'
      ];

      for (const dep of criticalDeps) {
        const depPath = path.join(__dirname, '../node_modules', dep);
        if (!fs.existsSync(depPath)) {
          this.log('error', `Critical dependency missing: ${dep}`);
        } else {
          this.log('success', `Dependency ${dep} installed`);
        }
      }

    } catch (error) {
      this.log('error', `Invalid package.json: ${error.message}`);
    }
  }

  async validateBuild() {
    this.log('info', 'Validating build configuration...');
    
    // Check TypeScript config
    const tsconfigPath = path.join(__dirname, '../tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      this.log('error', 'tsconfig.json not found');
    } else {
      this.log('success', 'tsconfig.json found');
    }

    // Check if dist folder exists
    const distPath = path.join(__dirname, '../dist');
    if (!fs.existsSync(distPath)) {
      this.log('warning', 'dist folder not found. Run "npm run build"');
    } else {
      this.log('success', 'dist folder found');
      
      // Check main entry point
      const mainPath = path.join(distPath, 'index.js');
      if (!fs.existsSync(mainPath)) {
        this.log('error', 'Built main file (dist/index.js) not found');
      } else {
        this.log('success', 'Built main file found');
      }
    }
  }

  async validateConfiguration() {
    this.log('info', 'Validating MCP configuration...');
    
    // Check example config
    const configExamplePath = path.join(__dirname, '../mcp_config.example.json');
    if (!fs.existsSync(configExamplePath)) {
      this.log('warning', 'mcp_config.example.json not found');
    } else {
      try {
        const config = JSON.parse(fs.readFileSync(configExamplePath, 'utf8'));
        this.log('success', 'MCP config example is valid JSON');
        
        if (config.mcpServers && config.mcpServers['pix-mcp']) {
          this.log('success', 'MCP server configuration structure is correct');
        } else {
          this.log('warning', 'MCP server configuration structure may be incorrect');
        }
      } catch (error) {
        this.log('error', `Invalid MCP config example: ${error.message}`);
      }
    }
  }

  async testConnection() {
    this.log('info', 'Testing Efí API connection...');
    
    if (!process.env.EFI_CLIENT_ID || !process.env.EFI_CLIENT_SECRET) {
      this.log('warning', 'Cannot test API connection: missing credentials');
      return;
    }

    try {
      // Basic validation without making actual API calls
      if (process.env.EFI_CLIENT_ID.length < 10) {
        this.log('warning', 'EFI_CLIENT_ID seems too short');
      }
      
      if (process.env.EFI_CLIENT_SECRET.length < 10) {
        this.log('warning', 'EFI_CLIENT_SECRET seems too short');
      }

      this.log('success', 'Credentials format appears valid');
      this.log('info', 'To test actual API connection, create a test Pix charge');
      
    } catch (error) {
      this.log('error', `Connection test failed: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 SETUP VALIDATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Successful checks: ${this.success.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }

    console.log('\n' + '='.repeat(60));
    
    if (this.errors.length === 0) {
      console.log('🎉 Setup validation completed successfully!');
      console.log('Your Pix MCP Server is ready to use.');
      
      console.log('\n📚 Next steps:');
      console.log('1. Add server to Claude Desktop configuration');
      console.log('2. Test with: "Create a Pix charge for R$ 10.00"');
      console.log('3. Check health with healthCheck tool');
      
      return true;
    } else {
      console.log('🔧 Please fix the errors above before proceeding.');
      return false;
    }
  }

  async run() {
    console.log('🔍 Starting Pix MCP Server setup validation...\n');
    
    await this.validateEnvironment();
    await this.validateDependencies();
    await this.validateBuild();
    await this.validateConfiguration();
    await this.testConnection();
    
    const success = await this.generateReport();
    process.exit(success ? 0 : 1);
  }
}

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Run validation
const validator = new SetupValidator();
validator.run().catch(error => {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
});
