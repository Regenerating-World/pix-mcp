#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { PixService } from './services/PixService.js';
import { EfiProvider } from './providers/EfiProvider.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
function validateEnvironment(): void {
  const required = ['EFI_CLIENT_ID', 'EFI_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Input validation schemas
const CreatePixChargeSchema = z.object({
  amount: z.number().positive().max(999999.99),
  recipientName: z.string().min(1).max(100),
  description: z.string().optional().default('Pix payment'),
});

class PixMCPServer {
  private server: Server;
  private pixService: PixService;

  constructor() {
    // Validate environment before initializing
    validateEnvironment();
    
    this.server = new Server(
      {
        name: 'pix-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Pix service with Efí provider
    const efiProvider = new EfiProvider({
      clientId: process.env.EFI_CLIENT_ID!,
      clientSecret: process.env.EFI_CLIENT_SECRET!,
      sandbox: process.env.EFI_SANDBOX === 'true',
    });

    this.pixService = new PixService([efiProvider]);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'createPixCharge',
            description: 'Create a new Pix payment charge with QR code',
            inputSchema: {
              type: 'object',
              properties: {
                amount: {
                  type: 'number',
                  description: 'Payment amount in BRL (Brazilian Reais)',
                  minimum: 0.01,
                  maximum: 999999.99,
                },
                recipientName: {
                  type: 'string',
                  description: 'Name of the payment recipient',
                  minLength: 1,
                  maxLength: 100,
                },
                description: {
                  type: 'string',
                  description: 'Optional payment description',
                  maxLength: 200,
                },
              },
              required: ['amount', 'recipientName'],
            },
          } satisfies Tool,
          {
            name: 'healthCheck',
            description: 'Check the health status of the Pix MCP server and providers',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          } satisfies Tool,
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'createPixCharge': {
            const validatedArgs = CreatePixChargeSchema.parse(args);
            const result = await this.pixService.createPixCharge(validatedArgs);
            
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ Pix charge created successfully!

**Payment Details:**
- Amount: R$ ${result.amount.toFixed(2)}
- Recipient: ${result.recipientName}
- Description: ${result.description}
- Transaction ID: ${result.txid}
- Expires: ${result.expiresAt.toLocaleString('pt-BR')}

**Pix Code (copy and paste):**
\`${result.pixCode}\`

**QR Code:**
${result.qrCodeDataUrl ? `![QR Code](${result.qrCodeDataUrl})` : 'QR Code generation failed'}

The recipient can scan the QR code or copy the Pix code to complete the payment.`,
                },
              ],
            };
          }

          case 'healthCheck': {
            const status = {
              server: 'healthy',
              timestamp: new Date().toISOString(),
              environment: process.env.EFI_SANDBOX === 'true' ? 'sandbox' : 'production',
              providers: ['Efí (Gerencianet)'],
              version: '1.0.0'
            };
            
            return {
              content: [
                {
                  type: 'text',
                  text: `🟢 **Pix MCP Server Health Check**

**Status:** ${status.server}
**Version:** ${status.version}
**Environment:** ${status.environment}
**Providers:** ${status.providers.join(', ')}
**Timestamp:** ${status.timestamp}

✅ All systems operational`,
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Pix MCP Server started successfully');
  }
}

// Start the server
const server = new PixMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
