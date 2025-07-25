import { StaticPixService } from '../services/StaticPixService.js';

describe('StaticPixService', () => {
  let service: StaticPixService;

  beforeEach(() => {
    service = new StaticPixService();
  });

  describe('createStaticPix', () => {
    it('should create a static Pix QR code with valid input', async () => {
      const request = {
        pixKey: 'test@example.com',
        amount: 10.5,
        recipientName: 'João Silva',
        recipientCity: 'São Paulo',
      };

      const result = await service.createStaticPix(request);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Static Pix QR code generated successfully!');
      expect(result).toHaveProperty('paymentDetails');
      expect(result.paymentDetails).toHaveProperty('pixKey', request.pixKey);
      expect(result.paymentDetails).toHaveProperty('amount', request.amount);
      expect(result.paymentDetails).toHaveProperty('amountFormatted', 'R$ 10.50');
      expect(result.paymentDetails).toHaveProperty('recipient', 'Joao Silva'); // Accents removed
      expect(result.paymentDetails).toHaveProperty('city', 'Sao Paulo'); // Accents removed
      expect(result).toHaveProperty('pixCode');
      expect(result).toHaveProperty('qrCodeDataUrl');

      // Verify Pix code format
      expect(result.pixCode).toMatch(/^00020101/); // EMV format start
      expect(result.pixCode).toMatch(/6304[A-F0-9]{4}$/); // CRC checksum at end

      // Verify QR code is a data URL
      expect(result.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('should handle CPF as Pix key', async () => {
      const request = {
        pixKey: '12345678901',
        amount: 100.0,
        recipientName: 'Pedro Costa',
        recipientCity: 'Brasília',
      };

      const result = await service.createStaticPix(request);

      expect(result.paymentDetails).toHaveProperty('pixKey', request.pixKey);
      expect(result.pixCode).toContain(request.pixKey);
      expect(result.paymentDetails.city).toBe('Brasilia'); // Accents removed
    });

    it('should handle CNPJ as Pix key', async () => {
      const request = {
        pixKey: '12345678000195',
        amount: 500.0,
        recipientName: 'Empresa LTDA',
        recipientCity: 'Salvador',
      };

      const result = await service.createStaticPix(request);

      expect(result.paymentDetails).toHaveProperty('pixKey', request.pixKey);
      expect(result.pixCode).toContain(request.pixKey);
    });

    it('should handle random key as Pix key', async () => {
      const request = {
        pixKey: '123e4567-e89b-12d3-a456-426614174000',
        amount: 75.5,
        recipientName: 'Ana Oliveira',
        recipientCity: 'Fortaleza',
      };

      const result = await service.createStaticPix(request);

      expect(result.paymentDetails).toHaveProperty('pixKey', request.pixKey);
      expect(result.pixCode).toContain(request.pixKey);
    });

    it('should format amount correctly in Pix code', async () => {
      const request = {
        pixKey: 'test@example.com',
        amount: 1.23,
        recipientName: 'Test User',
        recipientCity: 'Test City',
      };

      const result = await service.createStaticPix(request);

      // Amount should be formatted as "1.23" in the Pix code
      expect(result.pixCode).toContain('1.23');
    });

    it('should truncate long names and cities', async () => {
      const request = {
        pixKey: 'test@example.com',
        amount: 10.0,
        recipientName: 'Very Long Recipient Name That Exceeds The Twenty Five Character Limit',
        recipientCity: 'Very Long City Name That Exceeds The Fifteen Character Limit',
      };

      const result = await service.createStaticPix(request);

      expect(result.paymentDetails.recipient).toHaveLength(25);
      expect(result.paymentDetails.city).toHaveLength(15);
      expect(result.paymentDetails.recipient).toBe('Very Long Recipient Name ');
      expect(result.paymentDetails.city).toBe('Very Long City ');
    });

    it('should remove accents from names and cities', async () => {
      const request = {
        pixKey: 'test@example.com',
        amount: 15.75,
        recipientName: 'José Maria',
        recipientCity: 'Brasília',
      };

      const result = await service.createStaticPix(request);

      expect(result.paymentDetails.recipient).toBe('Jose Maria');
      expect(result.paymentDetails.city).toBe('Brasilia');
    });

    it('should handle phone number as Pix key', async () => {
      const request = {
        pixKey: '+5511999999999',
        amount: 25.0,
        recipientName: 'Maria Santos',
        recipientCity: 'Rio de Janeiro',
      };

      const result = await service.createStaticPix(request);

      expect(result).toHaveProperty('success', true);
      expect(result.paymentDetails).toHaveProperty('pixKey', request.pixKey);
      expect(result.paymentDetails).toHaveProperty('amount', request.amount);
      expect(result.paymentDetails).toHaveProperty('recipient', request.recipientName);
      expect(result.paymentDetails).toHaveProperty('city', request.recipientCity);
      expect(result).toHaveProperty('pixCode');
      expect(result).toHaveProperty('qrCodeDataUrl');
    });

    it('should not include field 62 (Additional Data) in PIX code when no description', async () => {
      const request = {
        pixKey: 'test@example.com',
        amount: 50.0,
        recipientName: 'Ana Costa',
        recipientCity: 'Florianopolis',
      };

      const result = await service.createStaticPix(request);

      // PIX code should not contain field 62 (Additional Data)
      expect(result.pixCode).not.toMatch(/62\d{2}/);

      // Should go directly from field 60 (city) to field 63 (CRC)
      expect(result.pixCode).toMatch(/60\d{2}.*6304[A-F0-9]{4}$/);
    });
  });
});
