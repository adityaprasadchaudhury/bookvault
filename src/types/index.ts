export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  purchasedBookIds?: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string;
  category: string;
  pages: number;
  language: string;
  isbn: string;
  createdAt: string;
  isPurchased?: boolean;
}

export interface PaymentRecord {
  id: string;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  amount: number;
  status: 'CREATED' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface PurchaseItem {
  orderId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  purchaseDate: string;
  book: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    category: string;
    pages: number;
    language: string;
    price: number;
  };
  payment: PaymentRecord | null;
}

export interface PaymentOrderResponse {
  orderId: string;
  gatewayOrderId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  keyId: string;
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    coverImage: string;
  };
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
