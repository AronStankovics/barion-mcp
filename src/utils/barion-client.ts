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

  private async request<T>(endpoint: string, data: Record<string, unknown>, method: 'POST' | 'GET' = 'POST'): Promise<T> {
    const params = {
      POSKey: this.poskey,
      ...data,
    };

    let url = `${this.baseUrl}${endpoint}`;
    let body: string | undefined;

    if (method === 'GET') {
      // For GET requests, append parameters as query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      url = `${url}?${queryParams.toString()}`;
      console.error(`[Barion API] GET Request to: ${url}`);
    } else {
      // For POST requests, send as JSON body
      body = JSON.stringify(params);
      console.error(`[Barion API] POST Request to: ${url}`);
      console.error(`[Barion API] Payload:`, JSON.stringify(params, null, 2));
    }

    const response = await fetch(url, {
      method,
      headers: method === 'POST' ? {
        'Content-Type': 'application/json',
      } : undefined,
      body,
    });

    console.error(`[Barion API] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Barion API] Error response body:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.error(`[Barion API] Response body:`, JSON.stringify(result, null, 2));

    // Check for Barion API errors
    if (result.Errors && result.Errors.length > 0) {
      console.error(`[Barion API] API Errors:`, result.Errors);
      throw new Error(`Barion API Error: ${result.Errors.map((e: any) => `${e.ErrorCode}: ${e.Title} - ${e.Description}`).join(', ')}`);
    }

    return result as T;
  }

  async startPayment(request: StartPaymentRequest): Promise<unknown> {
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

    return this.request('/v2/Payment/Start', payload);
  }

  async getPaymentState(paymentId: string): Promise<unknown> {
    return this.request('/v2/Payment/GetPaymentState', {
      PaymentId: paymentId,
    }, 'GET');
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

  async capturePayment(request: CapturePaymentRequest): Promise<unknown> {
    const payload = {
      PaymentId: request.paymentId,
      Transactions: request.transactions.map((t) => ({
        TransactionId: t.transactionId,
        Total: t.total,
      })),
    };

    return this.request('/v2/Payment/Capture', payload);
  }

  async cancelAuthorization(request: CancelAuthorizationRequest): Promise<unknown> {
    const payload = {
      PaymentId: request.paymentId,
    };

    return this.request('/v2/Payment/CancelAuthorization', payload);
  }
}
