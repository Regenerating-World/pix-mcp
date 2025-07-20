import axios, { AxiosInstance } from 'axios';
import QRCode from 'qrcode';
import {
  PixProvider,
  PixChargeRequest,
  PixChargeResponse,
  EfiConfig,
  EfiTokenResponse,
  EfiPixChargeRequest,
  EfiPixChargeResponse,
} from '../types/PixTypes.js';

export class EfiProvider implements PixProvider {
  public readonly name = 'Efí (Gerencianet)';
  private config: EfiConfig;
  private httpClient: AxiosInstance;
  private accessToken?: string;
  private tokenExpiresAt?: Date;

  constructor(config: EfiConfig) {
    this.config = config;
    
    const baseURL = config.sandbox
      ? 'https://pix-h.api.efipay.com.br'
      : 'https://pix.api.efipay.com.br';

    this.httpClient = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString('base64');

      const response = await this.httpClient.post<EfiTokenResponse>(
        '/oauth/token',
        { grant_type: 'client_credentials' },
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiration to 90% of the actual expiration time for safety
      this.tokenExpiresAt = new Date(Date.now() + response.data.expires_in * 900);

      return this.accessToken;
    } catch (error) {
      throw new Error(`Failed to get Efí access token: ${this.getErrorMessage(error)}`);
    }
  }

  async createPixCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
    try {
      const token = await this.getAccessToken();
      
      // Generate a unique transaction ID
      const txid = this.generateTxid();
      
      // For sandbox, we'll use a test Pix key
      // In production, this should be the merchant's actual Pix key
      const pixKey = this.config.sandbox 
        ? 'testepix@efipay.com.br' 
        : process.env.EFI_PIX_KEY || 'your-pix-key@example.com';

      const efiRequest: EfiPixChargeRequest = {
        calendario: {
          expiracao: 3600, // 1 hour expiration
        },
        devedor: {
          nome: request.recipientName,
        },
        valor: {
          original: request.amount.toFixed(2),
        },
        chave: pixKey,
        solicitacaoPagador: request.description || 'Pix payment',
      };

      const response = await this.httpClient.put<EfiPixChargeResponse>(
        `/v2/cob/${txid}`,
        efiRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Generate QR code from the Pix code
      let qrCodeDataUrl: string | undefined;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(response.data.pixCopiaECola, {
          width: 256,
          margin: 2,
        });
      } catch (qrError) {
        console.error('Failed to generate QR code:', qrError);
      }

      return {
        txid: response.data.txid,
        amount: parseFloat(response.data.valor.original),
        recipientName: request.recipientName,
        description: request.description || 'Pix payment',
        pixCode: response.data.pixCopiaECola,
        qrCodeDataUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
        provider: this.name,
      };
    } catch (error) {
      throw new Error(`Efí provider error: ${this.getErrorMessage(error)}`);
    }
  }

  private generateTxid(): string {
    // Generate a 32-character alphanumeric transaction ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object' && data.error_description) {
          return data.error_description;
        }
        if (typeof data === 'object' && data.message) {
          return data.message;
        }
        return JSON.stringify(data);
      }
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'Unknown error';
  }
}
