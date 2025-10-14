export interface WalletAccount {
  Id: string;
  Owner: string;
  Balance: number;
  Currency: string;
}

export interface BankAccount {
  Id: string;
  AccountNumber: string;
  BankName: string;
  Swift: string;
  Currency: string;
}

export interface Statement {
  TransactionId: string;
  Currency: string;
  Amount: number;
  TransactionTime: string;
  Comment: string;
  Type: string;
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
    data: Record<string, unknown>,
    method: 'GET' | 'POST' = 'POST'
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    let url = `${this.baseUrl}${endpoint}`;

    if (method === 'POST') {
      options.body = JSON.stringify(data);
    } else if (method === 'GET' && Object.keys(data).length > 0) {
      const params = new URLSearchParams(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      );
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, options);

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

  // Get wallet accounts
  async getAccounts(): Promise<WalletAccount[]> {
    const result = await this.request<{ Accounts: WalletAccount[] }>(
      '/v2/Wallet/Accounts',
      {}
    );
    return result.Accounts || [];
  }

  // Get account balance
  async getBalance(currency?: string): Promise<unknown> {
    const params = currency ? { Currency: currency } : {};
    return this.request('/v2/Wallet/Balance', params);
  }

  // Get bank accounts
  async getBankAccounts(currency?: string): Promise<BankAccount[]> {
    const params = currency ? { Currency: currency } : {};
    const result = await this.request<{ BankAccounts: BankAccount[] }>(
      '/v2/Wallet/BankAccounts',
      params
    );
    return result.BankAccounts || [];
  }

  // Get statement (transactions)
  async getStatement(params: {
    year: number;
    month: number;
    currency?: string;
  }): Promise<Statement[]> {
    const requestParams: Record<string, unknown> = {
      Year: params.year,
      Month: params.month,
    };
    if (params.currency) {
      requestParams.Currency = params.currency;
    }

    const result = await this.request<{ Transactions: Statement[] }>(
      '/v2/Wallet/Statement',
      requestParams
    );
    return result.Transactions || [];
  }

  // Withdraw to bank account
  async withdraw(params: {
    currency: string;
    amount: number;
    bankAccountId: string;
    comment?: string;
  }): Promise<unknown> {
    return this.request('/v2/Wallet/Withdraw', {
      Currency: params.currency,
      Amount: params.amount,
      BankAccountId: params.bankAccountId,
      Comment: params.comment || '',
    });
  }

  // Get user information
  async getUserInfo(): Promise<unknown> {
    return this.request('/v2/Wallet/UserInfo', {});
  }

  // Send money to email address
  async sendMoney(params: {
    recipientEmail: string;
    currency: string;
    amount: number;
    comment?: string;
  }): Promise<unknown> {
    return this.request('/v2/Wallet/SendMoney', {
      RecipientEmail: params.recipientEmail,
      Currency: params.currency,
      Amount: params.amount,
      Comment: params.comment || '',
    });
  }
}
