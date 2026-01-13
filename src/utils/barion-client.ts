// ============================================================================
// Request Types
// ============================================================================

export interface PaymentItem {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  itemTotal: number;
}

export interface PaymentTransaction {
  posTransactionId: string;
  payee: string;
  total: number;
  items: PaymentItem[];
}

export type Currency = 'HUF' | 'EUR' | 'USD' | 'CZK';
export type PaymentType = 'Immediate' | 'Reservation' | 'DelayedCapture';
export type PaymentStatus = 'Prepared' | 'Started' | 'InProgress' | 'Waiting' | 'Reserved' | 'Authorized' | 'Canceled' | 'Succeeded' | 'Failed' | 'PartiallySucceeded' | 'Expired';
export type TransactionStatus = 'Prepared' | 'Started' | 'Succeeded' | 'Timeout' | 'ShopCanceled' | 'UserCanceled' | 'Reserved' | 'Authorized' | 'Expired' | 'Refunded' | 'PartiallyRefunded';

export interface StartPaymentRequest {
  paymentType: PaymentType;
  currency: Currency;
  transactions: PaymentTransaction[];
  redirectUrl: string;
  callbackUrl: string;
  paymentRequestId?: string;
}

export interface FinishReservationRequest {
  paymentId: string;
  transactions: {
    transactionId: string;
    total: number;
  }[];
}

export interface RefundPaymentRequest {
  paymentId: string;
  transactionId: string;
  amount: number;
  comment?: string;
}

export interface CapturePaymentRequest {
  paymentId: string;
  transactions: {
    transactionId: string;
    total: number;
  }[];
}

export interface CancelAuthorizationRequest {
  paymentId: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface BarionError {
  ErrorCode: string;
  Title: string;
  Description: string;
  AuthData?: string;
  EndPoint?: string;
}

export interface TransactionDetail {
  TransactionId: string;
  POSTransactionId: string;
  TransactionTime: string;
  Total: number;
  Currency: Currency;
  Payer?: {
    Name?: string;
    Email?: string;
  };
  Payee: string;
  Comment?: string;
  Status: TransactionStatus;
  TransactionType?: string;
  Items?: {
    Name: string;
    Description: string;
    Quantity: number;
    Unit: string;
    UnitPrice: number;
    ItemTotal: number;
    SKU?: string;
  }[];
  RelatedId?: string;
  POSTransactionTime?: string;
}

export interface StartPaymentResponse {
  PaymentId: string;
  PaymentRequestId: string;
  Status: PaymentStatus;
  QRUrl?: string;
  RecurrenceResult?: string;
  GatewayUrl: string;
  RedirectUrl?: string;
  CallbackUrl?: string;
  Transactions?: TransactionDetail[];
  Errors?: BarionError[];
}

export interface PaymentStateResponse {
  PaymentId: string;
  PaymentRequestId: string;
  POSId: string;
  POSName: string;
  Status: PaymentStatus;
  PaymentType: PaymentType;
  FundingSource?: string;
  FundingSources?: string[];
  AllowedFundingSources?: string[];
  GuestCheckout: boolean;
  CreatedAt: string;
  ValidUntil: string;
  CompletedAt?: string;
  ReservedUntil?: string;
  Total: number;
  Currency: Currency;
  Transactions: TransactionDetail[];
  SuggestedLocale?: string;
  FraudRiskScore?: number;
  RedirectUrl?: string;
  CallbackUrl?: string;
  Errors?: BarionError[];
}

export interface FinishReservationResponse {
  IsSuccessful: boolean;
  PaymentId: string;
  PaymentRequestId: string;
  Status: PaymentStatus;
  Transactions: TransactionDetail[];
  Errors?: BarionError[];
}

export interface RefundPaymentResponse {
  IsSuccessful: boolean;
  PaymentId: string;
  PaymentRequestId: string;
  Status: PaymentStatus;
  TransactionId: string;
  Errors?: BarionError[];
}

export interface CapturePaymentResponse {
  IsSuccessful: boolean;
  PaymentId: string;
  PaymentRequestId: string;
  Status: PaymentStatus;
  Transactions: TransactionDetail[];
  Errors?: BarionError[];
}

export interface CancelAuthorizationResponse {
  IsSuccessful: boolean;
  PaymentId: string;
  PaymentRequestId: string;
  Status: PaymentStatus;
  Errors?: BarionError[];
}

// ============================================================================
// Import node-barion
// ============================================================================

import Barion from 'node-barion';

// ============================================================================
// BarionClient using node-barion
// ============================================================================

export class BarionClient {
  private barion: any;

  constructor(poskey: string, environment: 'test' | 'prod' = 'test') {
    this.barion = new Barion({
      POSKey: poskey,
      Environment: environment,
    });
  }

  async startPayment(request: StartPaymentRequest): Promise<StartPaymentResponse> {
    // Generate a unique PaymentRequestId if not provided
    const paymentRequestId = request.paymentRequestId || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const payload = {
      PaymentType: request.paymentType,
      PaymentRequestId: paymentRequestId,
      Currency: request.currency,
      FundingSources: ['All'],
      Transactions: request.transactions.map((t) => ({
        POSTransactionId: t.posTransactionId,
        Payee: t.payee,
        Total: t.total,
        Items: t.items.map((i) => ({
          Name: i.name,
          Description: i.description,
          Quantity: i.quantity,
          Unit: i.unit,
          UnitPrice: i.unitPrice,
          ItemTotal: i.itemTotal,
        })),
      })),
      RedirectUrl: request.redirectUrl,
      CallbackUrl: request.callbackUrl,
      GuestCheckOut: true,
      Locale: 'en-US',
    };

    console.error('[Barion API] Starting payment with node-barion');
    console.error('[Barion API] Payload:', JSON.stringify(payload, null, 2));

    const result = await this.barion.startPayment(payload);

    console.error('[Barion API] Response:', JSON.stringify(result, null, 2));

    // Check for Barion API errors
    if (result.Errors && result.Errors.length > 0) {
      console.error(`[Barion API] API Errors:`, result.Errors);
      throw new Error(`Barion API Error: ${result.Errors.map((e: any) => `${e.ErrorCode}: ${e.Title} - ${e.Description}`).join(', ')}`);
    }

    return result as StartPaymentResponse;
  }

  async getPaymentState(paymentId: string): Promise<PaymentStateResponse> {
    console.error('[Barion API] Getting payment state with node-barion');
    console.error('[Barion API] PaymentId:', paymentId);

    const result = await this.barion.getPaymentState({
      PaymentId: paymentId,
    });

    console.error('[Barion API] Response:', JSON.stringify(result, null, 2));

    // Check for Barion API errors
    if (result.Errors && result.Errors.length > 0) {
      console.error(`[Barion API] API Errors:`, result.Errors);
      throw new Error(`Barion API Error: ${result.Errors.map((e: any) => `${e.ErrorCode}: ${e.Title} - ${e.Description}`).join(', ')}`);
    }

    return result as PaymentStateResponse;
  }

  async finishReservation(request: FinishReservationRequest): Promise<FinishReservationResponse> {
    const payload = {
      PaymentId: request.paymentId,
      Transactions: request.transactions.map((t) => ({
        TransactionId: t.transactionId,
        Total: t.total,
      })),
    };

    console.error('[Barion API] Finishing reservation with node-barion');
    console.error('[Barion API] Payload:', JSON.stringify(payload, null, 2));

    const result = await this.barion.finishReservation(payload);

    console.error('[Barion API] Response:', JSON.stringify(result, null, 2));

    // Check for Barion API errors
    if (result.Errors && result.Errors.length > 0) {
      console.error(`[Barion API] API Errors:`, result.Errors);
      throw new Error(`Barion API Error: ${result.Errors.map((e: any) => `${e.ErrorCode}: ${e.Title} - ${e.Description}`).join(', ')}`);
    }

    return result as FinishReservationResponse;
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    const payload = {
      PaymentId: request.paymentId,
      TransactionId: request.transactionId,
      AmountToRefund: request.amount,
      Comment: request.comment || '',
    };

    console.error('[Barion API] Refunding payment with node-barion');
    console.error('[Barion API] Payload:', JSON.stringify(payload, null, 2));

    const result = await this.barion.refundPayment(payload);

    console.error('[Barion API] Response:', JSON.stringify(result, null, 2));

    // Check for Barion API errors
    if (result.Errors && result.Errors.length > 0) {
      console.error(`[Barion API] API Errors:`, result.Errors);
      throw new Error(`Barion API Error: ${result.Errors.map((e: any) => `${e.ErrorCode}: ${e.Title} - ${e.Description}`).join(', ')}`);
    }

    return result as RefundPaymentResponse;
  }

  async capturePayment(request: CapturePaymentRequest): Promise<CapturePaymentResponse> {
    const payload = {
      PaymentId: request.paymentId,
      Transactions: request.transactions.map((t) => ({
        TransactionId: t.transactionId,
        Total: t.total,
      })),
    };

    console.error('[Barion API] Capturing payment with node-barion');
    console.error('[Barion API] Payload:', JSON.stringify(payload, null, 2));

    const result = await this.barion.capturePayment(payload);

    console.error('[Barion API] Response:', JSON.stringify(result, null, 2));

    // Check for Barion API errors
    if (result.Errors && result.Errors.length > 0) {
      console.error(`[Barion API] API Errors:`, result.Errors);
      throw new Error(`Barion API Error: ${result.Errors.map((e: any) => `${e.ErrorCode}: ${e.Title} - ${e.Description}`).join(', ')}`);
    }

    return result as CapturePaymentResponse;
  }

  async cancelAuthorization(request: CancelAuthorizationRequest): Promise<CancelAuthorizationResponse> {
    const payload = {
      PaymentId: request.paymentId,
    };

    console.error('[Barion API] Canceling authorization with node-barion');
    console.error('[Barion API] Payload:', JSON.stringify(payload, null, 2));

    const result = await this.barion.cancelAuthorization(payload);

    console.error('[Barion API] Response:', JSON.stringify(result, null, 2));

    // Check for Barion API errors
    if (result.Errors && result.Errors.length > 0) {
      console.error(`[Barion API] API Errors:`, result.Errors);
      throw new Error(`Barion API Error: ${result.Errors.map((e: any) => `${e.ErrorCode}: ${e.Title} - ${e.Description}`).join(', ')}`);
    }

    return result as CancelAuthorizationResponse;
  }
}
