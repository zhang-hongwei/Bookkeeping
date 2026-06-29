import { create } from 'zustand';
import type {
  AccountResponse,
  Address,
  AutoTopUp,
  Billing,
  Plan,
  Usage,
  ApiKey,
} from '@/schemas/account';

interface AccountState {
  // Account data
  account: AccountResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAccount: (account: AccountResponse) => void;
  updatePlan: (plan: Plan) => void;
  updateUsage: (usage: Usage) => void;
  updateApiKey: (apiKey: ApiKey) => void;
  updateAutoTopUp: (autoTopUp: AutoTopUp) => void;
  updateBilling: (billing: Partial<Billing>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAccount: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  account: null,
  isLoading: false,
  error: null,

  setAccount: (account) => set({ account, error: null }),

  updatePlan: (plan) =>
    set((state) => ({
      account: state.account ? { ...state.account, plan } : null,
    })),

  updateUsage: (usage) =>
    set((state) => ({
      account: state.account ? { ...state.account, usage } : null,
    })),

  updateApiKey: (api_key) =>
    set((state) => ({
      account: state.account ? { ...state.account, api_key } : null,
    })),

  updateAutoTopUp: (auto_top_up) =>
    set((state) => ({
      account: state.account ? { ...state.account, auto_top_up } : null,
    })),

  updateBilling: (billingUpdate) =>
    set((state) => ({
      account: state.account
        ? {
            ...state.account,
            billing: { ...state.account.billing, ...billingUpdate },
          }
        : null,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearAccount: () => set({ account: null, error: null, isLoading: false }),
}));
