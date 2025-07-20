import { PixService } from '../services/PixService.js';
import { PixProvider, PixChargeRequest } from '../types/PixTypes.js';

// Mock provider for testing
class MockPixProvider implements PixProvider {
  name = 'Mock Provider';
  
  async createPixCharge(request: PixChargeRequest) {
    return {
      txid: 'mock-txid-123',
      amount: request.amount,
      recipientName: request.recipientName,
      description: request.description || 'Pix payment',
      pixCode: '00020126580014br.gov.bcb.pix0136mock-pix-key@example.com5204000053039865802BR5913Mock Recipient6009SAO PAULO62070503***6304ABCD',
      qrCodeDataUrl: 'data:image/png;base64,mock-qr-code',
      expiresAt: new Date(Date.now() + 3600000),
      provider: this.name,
    };
  }
}

describe('PixService', () => {
  let pixService: PixService;
  let mockProvider: MockPixProvider;

  beforeEach(() => {
    mockProvider = new MockPixProvider();
    pixService = new PixService([mockProvider]);
  });

  test('should create Pix charge successfully', async () => {
    const request: PixChargeRequest = {
      amount: 25.50,
      recipientName: 'João Silva',
      description: 'Test payment',
    };

    const result = await pixService.createPixCharge(request);

    expect(result.txid).toBe('mock-txid-123');
    expect(result.amount).toBe(25.50);
    expect(result.recipientName).toBe('João Silva');
    expect(result.description).toBe('Test payment');
    expect(result.provider).toBe('Mock Provider');
  });

  test('should handle provider failure', async () => {
    // Create a failing provider
    const failingProvider: PixProvider = {
      name: 'Failing Provider',
      createPixCharge: async () => {
        throw new Error('Provider unavailable');
      },
    };

    const pixServiceWithFailingProvider = new PixService([failingProvider]);

    const request: PixChargeRequest = {
      amount: 10.00,
      recipientName: 'Test User',
    };

    await expect(pixServiceWithFailingProvider.createPixCharge(request))
      .rejects.toThrow('All Pix providers failed');
  });
});
