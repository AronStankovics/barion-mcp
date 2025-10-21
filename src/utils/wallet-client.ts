// ============================================================================
// Type Definitions
// ============================================================================

export type Currency = 'HUF' | 'EUR' | 'USD' | 'CZK';

export interface WalletAccount {
  Id: string;
  Owner: string;
  Balance: number;
  Currency: Currency;
}

export interface AccountsResponse {
  Accounts: WalletAccount[];
  Errors?: Array<{
    ErrorCode: string;
    Title: string;
    Description: string;
  }>;
}

export interface Statement {
  TransactionId: string;
  Currency: Currency;
  Amount: number;
  TransactionTime: string;
  Comment: string;
  Type: string;
}

export interface StatementResponse {
  Transactions: Statement[];
  Errors?: Array<{
    ErrorCode: string;
    Title: string;
    Description: string;
  }>;
}

export interface WithdrawResponse {
  IsSuccessful: boolean;
  TransactionId?: string;
  Errors?: Array<{
    ErrorCode: string;
    Title: string;
    Description: string;
  }>;
}

export interface SendMoneyResponse {
  IsSuccessful: boolean;
  TransactionId?: string;
  SourceAccountId?: string;
  TargetEmail?: string;
  Amount?: {
    Currency: Currency;
    Value: number;
  };
  Errors?: Array<{
    ErrorCode: string;
    Title: string;
    Description: string;
  }>;
}

export class WalletClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, environment: 'test' | 'prod' = 'test') {
    this.apiKey = apiKey;
    this.baseUrl =
      environment === 'prod'
        ? 'https://api.barion.com'
        : 'https://api.test.barion.com';
  }

  private async request<T>(
    endpoint: string,
    data: Record<string, unknown> = {},
    method: 'GET' | 'POST' = 'GET'
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    let body: string | undefined;

    const headers: Record<string, string> = {
      'X-API-Key': this.apiKey,
    };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
      console.error(`[Barion Wallet API] POST Request to: ${url}`);
      console.error(`[Barion Wallet API] Payload:`, JSON.stringify(data, null, 2));
    } else {
      // For GET requests, append parameters as query string
      if (Object.keys(data).length > 0) {
        const params = new URLSearchParams(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        );
        url += `?${params.toString()}`;
      }
      console.error(`[Barion Wallet API] GET Request to: ${url}`);
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    console.error(`[Barion Wallet API] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Barion Wallet API] Error response body:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.error(`[Barion Wallet API] Response body:`, JSON.stringify(result, null, 2));

    // Check for Barion API errors
    if (result.Errors && result.Errors.length > 0) {
      console.error(`[Barion Wallet API] API Errors:`, result.Errors);
      throw new Error(`Barion Wallet API Error: ${result.Errors.map((e: any) => `${e.ErrorCode || 'Error'}: ${e.Title || e.Description || e}`).join(', ')}`);
    }

    return result as T;
  }

  // Get wallet accounts - v2 endpoint, requires wallet authentication
  async getAccounts(): Promise<WalletAccount[]> {
    const result = await this.request<AccountsResponse>(
      '/v2/accounts',
      {},
      'GET'
    );
    return result.Accounts || [];
  }

  // Get account balance - using accounts endpoint to derive balance
  async getBalance(currency?: Currency): Promise<WalletAccount[]> {
    const accounts = await this.getAccounts();
    if (currency) {
      return accounts.filter(acc => acc.Currency === currency);
    }
    return accounts;
  }

  // Get statement (transaction history) - v3 endpoint
  async getStatement(params: {
    year: number;
    month: number;
    currency?: Currency;
  }): Promise<Statement[]> {
    const requestParams: Record<string, unknown> = {
      Year: params.year,
      Month: params.month,
    };
    if (params.currency) {
      requestParams.Currency = params.currency;
    }

    // Using v3 UserHistory endpoint
    const result = await this.request<StatementResponse>(
      '/v3/userhistory/gethistory',
      requestParams,
      'GET'
    );
    return result.Transactions || [];
  }

  // Withdraw to bank account - v3 endpoint (v2 is obsolete as of 2022)
  async withdraw(params: {
    currency: Currency;
    amount: number;
    accountNumber: string;
    accountHolderName: string;
    swift: string;
    comment?: string;
  }): Promise<WithdrawResponse> {
    return this.request<WithdrawResponse>('/v3/withdraw/banktransfer', {
      Currency: params.currency,
      Amount: params.amount,
      BankAccount: {
        AccountNumber: params.accountNumber,
        AccountHolderName: params.accountHolderName,
        Swift: params.swift,
      },
      Comment: params.comment || '',
    }, 'POST');
  }

  // Send money to email address - v2 Transfer/Email endpoint (POST)
  async sendMoney(params: {
    recipientEmail: string;
    currency: Currency;
    amount: number;
    comment?: string;
    sourceAccountId?: string;
  }): Promise<SendMoneyResponse> {
    // If sourceAccountId is not provided, get the first account with matching currency
    let accountId = params.sourceAccountId;
    if (!accountId) {
      const accounts = await this.getAccounts();
      const matchingAccount = accounts.find(acc => acc.Currency === params.currency);
      if (!matchingAccount) {
        throw new Error(`No account found with currency ${params.currency}`);
      }
      accountId = matchingAccount.Id;
    }

    return this.request<SendMoneyResponse>('/v2/Transfer/Email', {
      SourceAccountId: accountId,
      Amount: {
        Currency: params.currency,
        Value: params.amount,
      },
      TargetEmail: params.recipientEmail,
      Comment: params.comment || '',
    }, 'POST');
  }
}
