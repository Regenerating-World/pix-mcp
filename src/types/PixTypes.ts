export interface PixChargeRequest {
  amount: number;
  pixKey: string;
  recipientName: string;
  recipientCity: string;
}

export interface PixChargeResponse {
  txid: string;
  amount: number;
  recipientName: string;
  pixCode: string;
  qrCodeDataUrl?: string;
  expiresAt: Date;
  provider: string;
}

export interface PixProvider {
  name: string;
  createPixCharge(request: PixChargeRequest): Promise<PixChargeResponse>;
}

// Static Pix specific interfaces
export interface StaticPixRequest {
  pixKey: string;
  amount: number;
  recipientName: string;
  recipientCity: string;
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
  };
  pixCode: string;
  qrCodeDataUrl?: string;
}
