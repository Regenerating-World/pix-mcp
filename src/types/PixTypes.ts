export interface PixChargeRequest {
  amount: number;
  recipientName: string;
  description?: string;
}

export interface PixChargeResponse {
  txid: string;
  amount: number;
  recipientName: string;
  description: string;
  pixCode: string;
  qrCodeDataUrl?: string;
  expiresAt: Date;
  provider: string;
}

export interface PixProvider {
  name: string;
  createPixCharge(request: PixChargeRequest): Promise<PixChargeResponse>;
}

// Efí specific types
export interface EfiConfig {
  clientId: string;
  clientSecret: string;
  sandbox: boolean;
}

export interface EfiTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface EfiPixChargeRequest {
  calendario: {
    expiracao: number;
  };
  devedor?: {
    nome: string;
  };
  valor: {
    original: string;
  };
  chave: string;
  solicitacaoPagador?: string;
}

export interface EfiPixChargeResponse {
  txid: string;
  revisao: number;
  loc: {
    id: number;
    location: string;
    tipoCob: string;
    criacao: string;
  };
  location: string;
  status: string;
  devedor?: {
    nome: string;
  };
  valor: {
    original: string;
  };
  chave: string;
  solicitacaoPagador?: string;
  pixCopiaECola: string;
}
