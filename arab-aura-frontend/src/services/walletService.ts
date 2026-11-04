// src/services/walletService.ts
import api from "./api";

export interface WalletData {
  balance: number;
  transactions: Array<{
    id: string;
    type: "deposit" | "payment" | "refund" | "withdrawal";
    amount: number;
    titleAr: string;
    titleEn: string;
    status: "completed" | "pending" | "failed";
    paymentMethod: string;
    date: string;
  }>;
}

export const walletService = {
  async getMyWallet(): Promise<WalletData> {
    try {
      const response = await api.get("/wallet/my-wallet");
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return { balance: 0, transactions: [] };
    } catch (err) {
      console.warn("Using offline wallet defaults:", err);
      return { balance: 0, transactions: [] };
    }
  },

  async deposit(amount: number, paymentMethod: string = "instapay") {
    const response = await api.post("/wallet/deposit", {
      amount,
      paymentMethod,
    });
    return response.data;
  },

  async withdraw(amount: number, paymentMethod: string, accountDetail: string) {
    const response = await api.post("/wallet/withdraw", {
      amount,
      paymentMethod,
      accountDetail,
    });
    return response.data;
  },
};

export default walletService;
