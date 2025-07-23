import { PixChargeRequest, PixChargeResponse, StaticPixRequest, StaticPixResponse } from '../types/PixTypes.js';
import { StaticPixService } from './StaticPixService.js';

export class PixService {
  private staticPixService: StaticPixService;

  constructor() {
    this.staticPixService = new StaticPixService();
  }

  /**
   * Creates a static Pix charge
   * @param request Pix charge request details
   * @returns Promise with the generated Pix code and QR code
   */
  async createStaticPix(request: StaticPixRequest): Promise<StaticPixResponse> {
    return this.staticPixService.createStaticPix(request);
  }

  /**
   * @deprecated Use createStaticPix instead
   */
  async createPixCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
    try {
      const result = await this.createStaticPix({
        pixKey: request.pixKey,
        amount: request.amount,
        recipientName: request.recipientName,
        recipientCity: request.recipientCity,
        description: request.description || ''
      });

      return {
        txid: `static-${Date.now()}`,
        amount: result.paymentDetails.amount,
        recipientName: result.paymentDetails.recipient,
        description: result.paymentDetails.description,
        pixCode: result.pixCode,
        qrCodeDataUrl: result.qrCodeDataUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        provider: 'static-pix'
      };
    } catch (error) {
      throw new Error(`Failed to create static Pix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the status of a Pix charge
   * @param _txid Transaction ID (unused for static Pix)
   * @returns Status of the Pix charge
   */
  async getPixStatus(_txid: string): Promise<{ status: string }> {
    // For static Pix, we don't have real status tracking
    // This is a placeholder that always returns 'completed' for backward compatibility
    return { status: 'completed' };
  }

  /**
   * Attempts to cancel a Pix charge
   * @param _txid Transaction ID (unused for static Pix)
   * @returns Success status of the cancellation
   */
  async cancelPixCharge(_txid: string): Promise<{ success: boolean }> {
    // Static Pix charges cannot be canceled
    // This is a placeholder for backward compatibility
    return { success: false };
  }
}
