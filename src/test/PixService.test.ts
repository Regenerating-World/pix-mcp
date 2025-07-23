import { PixService } from '../services/PixService.js';
import { PixChargeRequest } from '../types/PixTypes.js';

describe('PixService', () => {
  let pixService: PixService;

  beforeEach(() => {
    pixService = new PixService();
  });

  test('should create static Pix charge successfully', async () => {
    const request: PixChargeRequest = {
      amount: 25.50,
      recipientName: 'João Silva',
      recipientCity: 'São Paulo',
      description: 'Test payment',
      pixKey: 'test@example.com'
    };

    const result = await pixService.createStaticPix(request);

    expect(result).toHaveProperty('pixCode');
    expect(result).toHaveProperty('qrCodeDataUrl');
    expect(result.paymentDetails).toBeDefined();
    expect(result.pixCode).toContain('BR.GOV.BCB.PIX');
    expect(result.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(result.paymentDetails.amount).toBe(25.50);
    expect(result.paymentDetails.recipient).toBe('João Silva');
    expect(result.paymentDetails.pixKey).toBe('test@example.com');
    expect(result.paymentDetails.city).toBe('São Paulo');
  });
});
