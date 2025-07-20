import { PixProvider, PixChargeRequest, PixChargeResponse } from '../types/PixTypes.js';

export class PixService {
  private providers: PixProvider[];

  constructor(providers: PixProvider[]) {
    this.providers = providers;
  }

  async createPixCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
    let lastError: Error | null = null;

    // Try each provider in order until one succeeds
    for (const provider of this.providers) {
      try {
        console.error(`Attempting to create Pix charge with provider: ${provider.name}`);
        const result = await provider.createPixCharge(request);
        console.error(`Successfully created Pix charge with provider: ${provider.name}`);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown provider error');
        console.error(`Provider ${provider.name} failed:`, lastError.message);
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    throw new Error(
      `All Pix providers failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  // Future methods for Phase 2+
  async getPixStatus(_txid: string): Promise<{ status: 'pending' | 'paid' | 'expired' }> {
    // Implementation for Phase 2
    throw new Error('getPixStatus not implemented yet');
  }

  async cancelPixCharge(_txid: string): Promise<{ success: boolean }> {
    // Implementation for Phase 2
    throw new Error('cancelPixCharge not implemented yet');
  }
}
