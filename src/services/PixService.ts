import { PixChargeRequest, PixChargeResponse } from '../types/PixTypes.js';
import { StaticPixService } from './StaticPixService.js';

export class PixService {
  private staticPixService: StaticPixService;

  constructor() {
    this.staticPixService = new StaticPixService();
  }

  async createPixCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
    try {
      // Use static Pix service to generate the Pix code
      const result = await this.staticPixService.createStaticPix({
        pixKey: request.recipientName, // Using recipientName as pixKey for backward compatibility
        amount: request.amount,
        recipientName: request.recipientName,
        recipientCity: 'Sao Paulo', // Default city
        description: request.description || ''
      });

      return {
        txid: `static-${Date.now()}`,
        amount: request.amount,
        recipientName: request.recipientName,
        description: request.description || '',
        pixCode: result.pixCode,
        qrCodeDataUrl: result.qrCodeDataUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        provider: 'static-pix'
      };
    } catch (error) {
      throw new Error(`Failed to create static Pix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Future methods for Phase 2+
  async getPixStatus(_txid: string): Promise<{ status: 'pending' | 'paid' | 'expired' }> {
    // For static Pix, we can't check status, so we'll always return 'pending'
    return { status: 'pending' };
  }

  async cancelPixCharge(_txid: string): Promise<{ success: boolean }> {
    // For static Pix, we can't cancel, so we'll always return success
    return { success: true };
  }
}
