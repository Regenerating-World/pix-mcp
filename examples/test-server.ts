#!/usr/bin/env tsx

import { PixService } from '../src/services/PixService.js';
import { EfiProvider } from '../src/providers/EfiProvider.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPixServer() {
  console.log('🚀 Testing Pix MCP Server...\n');

  // Check if required environment variables are set
  if (!process.env.EFI_CLIENT_ID || !process.env.EFI_CLIENT_SECRET) {
    console.log('⚠️  Environment variables not configured.');
    console.log('Please copy .env.example to .env and configure your Efí credentials.\n');
    console.log('For testing purposes, here\'s what the server would do:\n');
    
    // Mock demonstration
    const mockResult = {
      txid: 'mock-txid-' + Math.random().toString(36).substr(2, 9),
      amount: 25.50,
      recipientName: 'João Silva',
      description: 'Test payment',
      pixCode: '00020126580014br.gov.bcb.pix0136mock-key@example.com5204000053039865802BR5913Joao Silva6009SAO PAULO62070503***6304ABCD',
      qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      expiresAt: new Date(Date.now() + 3600000),
      provider: 'Efí (Mock)',
    };

    console.log('✅ Mock Pix charge created successfully!');
    console.log(`📋 Transaction ID: ${mockResult.txid}`);
    console.log(`💰 Amount: R$ ${mockResult.amount.toFixed(2)}`);
    console.log(`👤 Recipient: ${mockResult.recipientName}`);
    console.log(`📝 Description: ${mockResult.description}`);
    console.log(`⏰ Expires: ${mockResult.expiresAt.toLocaleString('pt-BR')}`);
    console.log(`🏦 Provider: ${mockResult.provider}`);
    console.log(`📱 Pix Code: ${mockResult.pixCode.substring(0, 50)}...`);
    console.log(`🔗 QR Code: Generated successfully\n`);
    
    return;
  }

  try {
    // Initialize the Pix service with Efí provider
    const efiProvider = new EfiProvider({
      clientId: process.env.EFI_CLIENT_ID,
      clientSecret: process.env.EFI_CLIENT_SECRET,
      sandbox: process.env.EFI_SANDBOX === 'true',
    });

    const pixService = new PixService([efiProvider]);

    // Test creating a Pix charge
    const testRequest = {
      amount: 25.50,
      recipientName: 'João Silva',
      description: 'Test payment from Pix MCP Server',
    };

    console.log('📤 Creating Pix charge...');
    console.log(`   Amount: R$ ${testRequest.amount.toFixed(2)}`);
    console.log(`   Recipient: ${testRequest.recipientName}`);
    console.log(`   Description: ${testRequest.description}\n`);

    const result = await pixService.createPixCharge(testRequest);

    console.log('✅ Pix charge created successfully!');
    console.log(`📋 Transaction ID: ${result.txid}`);
    console.log(`💰 Amount: R$ ${result.amount.toFixed(2)}`);
    console.log(`👤 Recipient: ${result.recipientName}`);
    console.log(`📝 Description: ${result.description}`);
    console.log(`⏰ Expires: ${result.expiresAt.toLocaleString('pt-BR')}`);
    console.log(`🏦 Provider: ${result.provider}`);
    console.log(`📱 Pix Code: ${result.pixCode.substring(0, 50)}...`);
    console.log(`🔗 QR Code: ${result.qrCodeDataUrl ? 'Generated successfully' : 'Generation failed'}\n`);

    console.log('🎉 Test completed successfully!');
    console.log('The Pix MCP Server is ready to be used with Claude Desktop.');

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : error);
    console.log('\n💡 Tips:');
    console.log('- Make sure your Efí credentials are correct');
    console.log('- Check if you\'re using sandbox mode for testing');
    console.log('- Verify your internet connection');
  }
}

// Run the test
testPixServer().catch(console.error);
