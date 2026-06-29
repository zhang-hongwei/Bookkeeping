import type {
  AccountResponse,
  Address,
  AutoTopUp,
  BillingEmailsUpdate,
  Invoice,
} from '@/schemas/account';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.asindataapi.com';

/**
 * Get API key from storage or environment
 */
function getApiKey(): string {
  // In a real app, this would be retrieved from secure storage or context
  return process.env.NEXT_PUBLIC_API_KEY || '';
}

/**
 * Get account information
 */
export async function getAccount(): Promise<AccountResponse> {
  const response = await fetch(`${API_BASE_URL}/account`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKey(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch account information');
  }

  return response.json();
}

/**
 * Update billing address
 */
export async function updateBillingAddress(address: Address): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/account/billing/address`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKey(),
    },
    body: JSON.stringify(address),
  });

  if (!response.ok) {
    throw new Error('Failed to update billing address');
  }
}

/**
 * Add or update payment method
 */
export async function updatePaymentMethod(
  token: string,
  setAsDefault: boolean = false
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/account/billing/payment-method`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKey(),
    },
    body: JSON.stringify({ token, set_as_default: setAsDefault }),
  });

  if (!response.ok) {
    throw new Error('Failed to update payment method');
  }
}

/**
 * Update billing emails
 */
export async function updateBillingEmails(data: BillingEmailsUpdate): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/account/billing/emails`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKey(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update billing emails');
  }
}

/**
 * Regenerate API key
 */
export async function regenerateApiKey(): Promise<{ key: string; created_at: string }> {
  const response = await fetch(`${API_BASE_URL}/account/api-key/regenerate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKey(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to regenerate API key');
  }

  return response.json();
}

/**
 * Get usage statistics
 */
export async function getUsage(): Promise<{
  requests_remaining: number;
  requests_used: number;
  reset_date?: string;
}> {
  const response = await fetch(`${API_BASE_URL}/account/usage`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKey(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch usage statistics');
  }

  return response.json();
}

/**
 * Update auto top-up configuration
 */
export async function updateAutoTopUp(config: AutoTopUp): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/account/auto-top-up`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKey(),
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error('Failed to update auto top-up configuration');
  }
}

/**
 * Get invoices
 */
export async function getInvoices(params?: {
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}): Promise<{ invoices: Invoice[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.start_date) searchParams.append('start_date', params.start_date);
  if (params?.end_date) searchParams.append('end_date', params.end_date);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/account/invoices?${searchParams}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKey(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return response.json();
}
