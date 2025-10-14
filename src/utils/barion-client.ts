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

export interface StartPaymentRequest {
  paymentType: 'Immediate' | 'Reservation' | 'DelayedCapture';
  currency: string;
  transactions: PaymentTransaction[];
  redirectUrl: string;
  callbackUrl: string;
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

export class BarionClient {
  private poskey: string;
  private baseUrl: string;

  constructor(poskey: string, environment: 'test' | 'prod' = 'test') {
    this.poskey = poskey;
    this.baseUrl =
      environment === 'prod'
        ? 'https://api.barion.com'
        : 'https://api.test.barion.com';
  }

  private async request<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        POSKey: this.poskey,
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Check for Barion API errors
    if (result.Errors && result.Errors.length > 0) {
      throw new Error(`Barion API Error: ${result.Errors.join(', ')}`);
    }

    return result as T;
  }

  async startPayment(request: StartPaymentRequest): Promise<unknown> {
    const payload = {
      PaymentType: request.paymentType,
      Currency: request.currency,
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

    return this.request('/v2/Payment/Start', payload);
  }

  async getPaymentState(paymentId: string): Promise<unknown> {
    return this.request('/v2/Payment/GetPaymentState', {
      PaymentId: paymentId,
    });
  }

  async finishReservation(request: FinishReservationRequest): Promise<unknown> {
    const payload = {
      PaymentId: request.paymentId,
      Transactions: request.transactions.map((t) => ({
        TransactionId: t.transactionId,
        Total: t.total,
      })),
    };

    return this.request('/v2/Payment/FinishReservation', payload);
  }

  async refundPayment(request: RefundPaymentRequest): Promise<unknown> {
    const payload = {
      PaymentId: request.paymentId,
      TransactionId: request.transactionId,
      AmountToRefund: request.amount,
      Comment: request.comment || '',
    };

    return this.request('/v2/Payment/Refund', payload);
  }
}
