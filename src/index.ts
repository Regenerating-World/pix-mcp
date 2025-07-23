#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import http from 'http';
import { URL } from 'url';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { StaticPixService } from './services/StaticPixService.js';

// Input validation schema for static Pix generation
const GenerateStaticPixSchema = z.object({
  pixKey: z.string().min(1).max(77),
  amount: z.number().positive().max(999999.99),
  recipientName: z.string().min(1).max(25),
  recipientCity: z.string().min(1).max(15),
  description: z.string().optional().default(''),
});

class PixMCPServer {
  private server: Server;
  private staticPixService: StaticPixService;
  private httpServer: http.Server | null = null;

  constructor() {
    // Initialize MCP server
    this.server = new Server(
      {
        name: 'pix-mcp-server',
        version: '1.0.0',
        description: 'Pix MCP Server for generating static Pix QR codes',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize services
    this.staticPixService = new StaticPixService();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generateStaticPix',
            description: 'Generate a static Pix QR code for any Pix key (works without API credentials)',
            inputSchema: {
              type: 'object',
              properties: {
                pixKey: {
                  type: 'string',
                  description: 'Pix key (email, phone +5511999999999, CPF, CNPJ, or random key)',
                  minLength: 1,
                  maxLength: 77,
                },
                amount: {
                  type: 'number',
                  description: 'Payment amount in BRL (Brazilian Reais)',
                  minimum: 0.01,
                  maximum: 999999.99,
                },
                recipientName: {
                  type: 'string',
                  description: 'Name of the payment recipient (max 25 chars)',
                  minLength: 1,
                  maxLength: 25,
                },
                recipientCity: {
                  type: 'string',
                  description: 'City of the payment recipient',
                  minLength: 1,
                  maxLength: 15,
                },
                description: {
                  type: 'string',
                  description: 'Optional payment description',
                  maxLength: 25,
                },
              },
              required: ['pixKey', 'amount', 'recipientName', 'recipientCity'],
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
          case 'generateStaticPix': {
            const validatedArgs = GenerateStaticPixSchema.parse(args);
            const result = await this.staticPixService.createStaticPix(validatedArgs);
            
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ Pix charge created successfully!

**Payment Details:**
- Amount: R$ ${result.paymentDetails.amountFormatted}
- Recipient: ${result.paymentDetails.recipient}
- Description: ${result.paymentDetails.description || 'N/A'}
- PIX Key: ${result.paymentDetails.pixKey}
- City: ${result.paymentDetails.city}

**Pix Code (copy and paste):**
\`${result.pixCode}\`

**QR Code:**
${result.qrCodeDataUrl ? `![QR Code](${result.qrCodeDataUrl})` : 'QR Code generation failed'}

⚠️ **Note**: This is a static Pix code. Payment confirmation must be checked manually by the recipient.`
                }
              ]
            };
          }

          case 'healthCheck': {
            const status = {
              server: 'healthy',
              timestamp: new Date().toISOString(),
              version: '2.0.0',
              mode: 'static-pix',
              status: 'operational'
            };
            
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ Server is healthy\nVersion: ${status.version}\nMode: ${status.mode}\nStatus: ${status.status}`
                }
              ],
              status
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

  async startHttp(port: number): Promise<void> {
    const server = http.createServer(async (req, res) => {
      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      const url = new URL(req.url!, `http://${req.headers.host}`);
      
      if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'healthy', 
          service: 'pix-mcp-server',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        }));
        return;
      }

      if (url.pathname === '/tools' && req.method === 'GET') {
        const tools = {
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
            },
            {
              name: 'generateStaticPix',
              description: 'Generate a static Pix QR code for any Pix key (works without API credentials)',
              inputSchema: {
                type: 'object',
                properties: {
                  pixKey: {
                    type: 'string',
                    description: 'Pix key (email, phone +5511999999999, CPF, CNPJ, or random key)',
                    minLength: 1,
                    maxLength: 77,
                  },
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
                    maxLength: 25,
                  },
                  recipientCity: {
                    type: 'string',
                    description: 'City of the payment recipient',
                    minLength: 1,
                    maxLength: 15,
                  },
                  description: {
                    type: 'string',
                    description: 'Optional payment description',
                    maxLength: 25,
                  },
                },
                required: ['pixKey', 'amount', 'recipientName', 'recipientCity'],
              },
            },
            {
              name: 'healthCheck',
              description: 'Check the health status of the Pix MCP server and providers',
              inputSchema: {
                type: 'object',
                properties: {},
                required: [],
              },
            },
          ],
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tools));
        return;
      }

      if (url.pathname === '/tools/call' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { name, arguments: args } = JSON.parse(body);
            
            // Handle tool calls directly
            if (name === 'generateStaticPix') {
              const validatedArgs = GenerateStaticPixSchema.parse(args);
              const result = await this.staticPixService.createStaticPix(validatedArgs);
              
              const response = {
                content: [{
                  type: 'text',
                  text: `✅ Static Pix QR code generated successfully!

**Payment Details:**
- Amount: ${result.paymentDetails.amountFormatted}
- Recipient: ${result.paymentDetails.recipient}
- City: ${result.paymentDetails.city}
- Description: ${result.paymentDetails.description || 'N/A'}

**Pix Code (copy and paste):**
\`${result.pixCode}\`

**QR Code:**
${result.qrCodeDataUrl ? `![QR Code](${result.qrCodeDataUrl})` : 'QR Code generation failed'}

⚠️ **Note**: This is a static Pix code. Payment confirmation must be checked manually by the recipient.`
                }]
              };
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(response));
            } else if (name === 'healthCheck') {
              const status = {
                server: 'healthy',
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                mode: 'static-pix',
                status: 'operational'
              };
              
              const response = {
                content: [{
                  type: 'text',
                  text: `🟢 **Pix MCP Server Health Check**

**Status:** ${status.server}
**Version:** ${status.version}
**Mode:** ${status.mode}
**Timestamp:** ${status.timestamp}

✅ All systems operational`
                }]
              };
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(response));
            } else {
              throw new Error(`Unknown tool: ${name}`);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const response = {
              content: [{
                type: 'text',
                text: `❌ Error: ${errorMessage}`,
              }],
              isError: true,
            };
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
          }
        });
        return;
      }

      // Default response
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    server.listen(port, () => {
      console.error(`Pix MCP Server started in HTTP mode on port ${port}`);
      console.error(`Health check: http://localhost:${port}/health`);
      console.error(`Tools: http://localhost:${port}/tools`);
      console.error(`Call tools: POST http://localhost:${port}/tools/call`);
    });
  }

  async start(): Promise<void> {
    const mode = process.env.MCP_MODE || 'stdio';
    const port = parseInt('3000');

    if (mode === 'http') {
      await this.startHttp(port);
    } else {
      // Default stdio mode for local use
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('Pix MCP Server started in stdio mode');
    }
  }
}

// Start the server
const server = new PixMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
