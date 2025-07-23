/**
 * Static Pix Service
 * Generates static Pix QR codes following BACEN EMV 4.0 standard
 * Works with any Pix key without requiring API credentials
 */

import QRCode from 'qrcode';

export interface StaticPixRequest {
  pixKey: string;
  amount: number;
  recipientName: string;
  recipientCity: string;
  description?: string;
}

export interface StaticPixResponse {
  success: boolean;
  message: string;
  paymentDetails: {
    pixKey: string;
    amount: number;
    amountFormatted: string;
    recipient: string;
    city: string;
    description: string;
  };
  pixCode: string;
  qrCodeDataUrl: string;
}

export class StaticPixService {
  /**
   * Calculates CRC16-CCITT checksum for Pix payload
   */
  private calculateCRC16(payload: string): string {
    const polynomial = 0x1021;
    let crc = 0xffff;

    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc = crc << 1;
        }
        crc &= 0xffff;
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Formats a field according to EMV standard: ID + LENGTH + VALUE
   */
  private formatEMVField(id: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
  }

  /**
   * Validates Pix key format
   */
  private validatePixKey(pixKey: string): boolean {
    // Email format
    if (pixKey.includes('@') && pixKey.includes('.')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey);
    }

    // Phone format (+5511999999999)
    if (pixKey.startsWith('+55')) {
      return /^\+55\d{10,11}$/.test(pixKey);
    }

    // CPF format (11 digits)
    if (/^\d{11}$/.test(pixKey)) {
      return true;
    }

    // CNPJ format (14 digits)
    if (/^\d{14}$/.test(pixKey)) {
      return true;
    }

    // Random key (UUID format)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pixKey)) {
      return true;
    }

    return false;
  }

  /**
   * Removes accents and normalizes text for PIX compatibility
   *
   * Complies with BACEN BR Code Manual v2.0.0+ (May 2020):
   * - Spaces are officially allowed in field 62.05 (Additional Data - Reference Label)
   * - Removes diacritical marks (ã, ç, é, etc.) for maximum compatibility
   * - Preserves spaces, hyphens, periods, and commas
   * - Reference: "The restriction that established that only alphanumeric characters
   *   could be used has been removed" - BACEN BR Code Manual v2.0.0
   */
  private removeAccents(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .replace(/[^\w\s\-.,]/gi, '') // Keep only word chars, spaces, and basic punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Generates static Pix payload according to BACEN EMV 4.0 standard
   */
  private generatePixPayload({
    pixKey,
    amount,
    recipientName,
    recipientCity,
    description,
  }: StaticPixRequest): string {
    // Validate inputs
    if (!this.validatePixKey(pixKey)) {
      throw new Error('Invalid Pix key format');
    }

    if (amount <= 0 || amount > 999999.99) {
      throw new Error('Amount must be between 0.01 and 999,999.99');
    }

    // Remove accents and truncate names if they exceed limits
    const cleanRecipientName = this.removeAccents(recipientName);
    const cleanRecipientCity = this.removeAccents(recipientCity);
    const truncatedRecipientName = cleanRecipientName.substring(0, 25);
    const truncatedRecipientCity = cleanRecipientCity.substring(0, 15);

    // Build EMV payload
    let payload = '';

    // Payload Format Indicator (00)
    payload += this.formatEMVField('00', '01');

    // Point of Initiation Method (01) - Static QR Code
    payload += this.formatEMVField('01', '12');

    // Merchant Account Information (26)
    const merchantInfo =
      this.formatEMVField('00', 'BR.GOV.BCB.PIX') + this.formatEMVField('01', pixKey);
    payload += this.formatEMVField('26', merchantInfo);

    // Merchant Category Code (52) - Generic
    payload += this.formatEMVField('52', '0000');

    // Transaction Currency (53) - BRL (986)
    payload += this.formatEMVField('53', '986');

    // Transaction Amount (54)
    payload += this.formatEMVField('54', amount.toFixed(2));

    // Country Code (58)
    payload += this.formatEMVField('58', 'BR');

    // Merchant Name (59)
    payload += this.formatEMVField('59', truncatedRecipientName);

    // Merchant City (60)
    payload += this.formatEMVField('60', truncatedRecipientCity);

    // Additional Data Field Template (62)
    if (description) {
      const cleanDescription = this.removeAccents(description);
      const additionalData = this.formatEMVField('05', cleanDescription.substring(0, 25));
      payload += this.formatEMVField('62', additionalData);
    }

    // CRC16 (63) - Calculate and append
    const payloadWithoutCRC = payload + '6304';
    const crc = this.calculateCRC16(payloadWithoutCRC);
    payload += '6304' + crc;

    return payload;
  }

  /**
   * Generates QR Code image from Pix payload
   */
  private async generateQRCode(payload: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 256,
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(
        `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Creates a static Pix charge
   */
  async createStaticPix(request: StaticPixRequest): Promise<StaticPixResponse> {
    try {
      // Generate Pix payload
      const pixCode = this.generatePixPayload(request);

      // Generate QR Code
      const qrCodeDataUrl = await this.generateQRCode(pixCode);

      // Apply same cleaning and truncation as in payload generation
      const cleanRecipientName = this.removeAccents(request.recipientName);
      const cleanRecipientCity = this.removeAccents(request.recipientCity);
      const truncatedRecipientName = cleanRecipientName.substring(0, 25);
      const truncatedRecipientCity = cleanRecipientCity.substring(0, 15);

      return {
        success: true,
        message: 'Static Pix QR code generated successfully!',
        paymentDetails: {
          pixKey: request.pixKey,
          amount: request.amount,
          amountFormatted: `R$ ${request.amount.toFixed(2)}`,
          recipient: truncatedRecipientName,
          city: truncatedRecipientCity,
          description: request.description ? this.removeAccents(request.description) : '',
        },
        pixCode,
        qrCodeDataUrl,
      };
    } catch (error) {
      throw new Error(
        `Failed to create static Pix: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
