// İyzico Payment Integration Service for Turkish Market
// Note: This is a mock implementation. Real İyzico integration requires proper API keys and configuration

export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string; // sandbox or production
}

export interface IyzicoCustomer {
  id: string;
  name: string;
  surname: string;
  email: string;
  identityNumber: string;
  gsmNumber: string;
  registrationDate: string;
  lastLoginDate: string;
  registrationAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
}

export interface IyzicoPaymentCard {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  registerCard?: string;
}

export interface IyzicoBasketItem {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: 'PHYSICAL' | 'VIRTUAL';
  price: string;
}

export interface IyzicoPaymentRequest {
  locale: 'tr' | 'en';
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: 'TRY' | 'USD' | 'EUR';
  installment: number;
  basketId: string;
  paymentChannel: 'WEB' | 'MOBILE';
  paymentGroup: 'PRODUCT' | 'SUBSCRIPTION';
  paymentCard: IyzicoPaymentCard;
  buyer: IyzicoCustomer;
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  basketItems: IyzicoBasketItem[];
}

export interface IyzicoPaymentResponse {
  status: 'success' | 'failure';
  locale: string;
  systemTime: number;
  conversationId: string;
  paymentId?: string;
  paymentStatus?: 'SUCCESS' | 'FAILURE' | 'INIT_THREEDS' | 'CALLBACK_THREEDS';
  fraudStatus?: number;
  merchantCommissionRate?: string;
  merchantCommissionRateAmount?: string;
  iyziCommissionRateAmount?: string;
  iyziCommissionFee?: string;
  cardType?: 'CREDIT_CARD' | 'DEBIT_CARD';
  cardAssociation?: 'VISA' | 'MASTER_CARD' | 'AMERICAN_EXPRESS';
  cardFamily?: string;
  binNumber?: string;
  lastFourDigits?: string;
  basketId?: string;
  currency?: string;
  price?: string;
  paidPrice?: string;
  installment?: number;
  paymentTransactions?: Array<{
    paymentTransactionId: string;
    transactionStatus: string;
    price: string;
    paidPrice: string;
    merchantCommissionRate: string;
    merchantCommissionRateAmount: string;
    iyziCommissionRateAmount: string;
    iyziCommissionFee: string;
    blockageRate: string;
    blockageRateAmountMerchant: string;
    blockageRateAmountSubMerchant: string;
    blockageResolvedDate: string;
    subMerchantPrice: string;
    subMerchantPayoutRate: string;
    subMerchantPayoutAmount: string;
    merchantPayoutAmount: string;
    convertedPayout: {
      paidPrice: string;
      iyziCommissionRateAmount: string;
      iyziCommissionFee: string;
      blockageRateAmountMerchant: string;
      blockageRateAmountSubMerchant: string;
      subMerchantPayoutAmount: string;
      merchantPayoutAmount: string;
      iyziConversionRate: string;
      iyziConversionRateAmount: string;
      currency: string;
    };
  }>;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
}

export interface IyzicoSubscriptionRequest {
  locale: 'tr' | 'en';
  conversationId: string;
  subscriptionInitialStatus: 'ACTIVE' | 'PENDING';
  customer: IyzicoCustomer;
  paymentCard: IyzicoPaymentCard;
  plan: {
    planReferenceCode: string;
    name: string;
    price: string;
    currencyCode: 'TRY';
    paymentInterval: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    paymentIntervalCount: number;
    trialPeriodDays?: number;
    planStartDate?: string;
  };
}

export interface IyzicoSubscriptionResponse {
  status: 'success' | 'failure';
  locale: string;
  systemTime: number;
  conversationId: string;
  subscriptionReferenceCode?: string;
  parentReferenceCode?: string;
  customerReferenceCode?: string;
  subscriptionStatus?: 'ACTIVE' | 'CANCELED' | 'UNPAID' | 'PENDING';
  trialEndDate?: string;
  trialDays?: number;
  startDate?: string;
  endDate?: string;
  planReferenceCode?: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
}

export class IyzicoService {
  private config: IyzicoConfig;

  constructor(config: IyzicoConfig) {
    this.config = config;
  }

  // Mock implementation - Replace with actual İyzico SDK integration
  async createPayment(paymentRequest: IyzicoPaymentRequest): Promise<IyzicoPaymentResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful payment for development
    if (paymentRequest.paymentCard.cardNumber === '5528790000000008') {
      return {
        status: 'success',
        locale: paymentRequest.locale,
        systemTime: Date.now(),
        conversationId: paymentRequest.conversationId,
        paymentId: `pay_${Date.now()}`,
        paymentStatus: 'SUCCESS',
        fraudStatus: 1,
        merchantCommissionRate: '10.00',
        merchantCommissionRateAmount: '5.00',
        iyziCommissionRateAmount: '0.25',
        iyziCommissionFee: '0.25',
        cardType: 'CREDIT_CARD',
        cardAssociation: 'MASTER_CARD',
        cardFamily: 'Bonus',
        binNumber: '552879',
        lastFourDigits: '0008',
        basketId: paymentRequest.basketId,
        currency: paymentRequest.currency,
        price: paymentRequest.price,
        paidPrice: paymentRequest.paidPrice,
        installment: paymentRequest.installment,
        paymentTransactions: [{
          paymentTransactionId: `trx_${Date.now()}`,
          transactionStatus: 'SUCCESS',
          price: paymentRequest.price,
          paidPrice: paymentRequest.paidPrice,
          merchantCommissionRate: '10.00',
          merchantCommissionRateAmount: '5.00',
          iyziCommissionRateAmount: '0.25',
          iyziCommissionFee: '0.25',
          blockageRate: '10.00',
          blockageRateAmountMerchant: '5.00',
          blockageRateAmountSubMerchant: '0.00',
          blockageResolvedDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          subMerchantPrice: '0.00',
          subMerchantPayoutRate: '0.00',
          subMerchantPayoutAmount: '0.00',
          merchantPayoutAmount: paymentRequest.paidPrice,
          convertedPayout: {
            paidPrice: paymentRequest.paidPrice,
            iyziCommissionRateAmount: '0.25',
            iyziCommissionFee: '0.25',
            blockageRateAmountMerchant: '5.00',
            blockageRateAmountSubMerchant: '0.00',
            subMerchantPayoutAmount: '0.00',
            merchantPayoutAmount: paymentRequest.paidPrice,
            iyziConversionRate: '1.00',
            iyziConversionRateAmount: '0.00',
            currency: 'TRY'
          }
        }]
      };
    }

    // Mock failed payment
    return {
      status: 'failure',
      locale: paymentRequest.locale,
      systemTime: Date.now(),
      conversationId: paymentRequest.conversationId,
      errorCode: 'NOT_SUFFICIENT_FUNDS',
      errorMessage: 'Yetersiz bakiye',
      errorGroup: 'NOT_SUFFICIENT_FUNDS'
    };
  }

  async createSubscription(subscriptionRequest: IyzicoSubscriptionRequest): Promise<IyzicoSubscriptionResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful subscription creation
    return {
      status: 'success',
      locale: subscriptionRequest.locale,
      systemTime: Date.now(),
      conversationId: subscriptionRequest.conversationId,
      subscriptionReferenceCode: `sub_${Date.now()}`,
      parentReferenceCode: `parent_${Date.now()}`,
      customerReferenceCode: `cust_${Date.now()}`,
      subscriptionStatus: 'ACTIVE',
      trialEndDate: subscriptionRequest.plan.trialPeriodDays ? 
        new Date(Date.now() + subscriptionRequest.plan.trialPeriodDays * 24 * 60 * 60 * 1000).toISOString() : 
        undefined,
      trialDays: subscriptionRequest.plan.trialPeriodDays,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      planReferenceCode: subscriptionRequest.plan.planReferenceCode
    };
  }

  async cancelSubscription(subscriptionReferenceCode: string): Promise<{ status: 'success' | 'failure'; errorMessage?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock successful cancellation
    return {
      status: 'success'
    };
  }

  async refundPayment(paymentTransactionId: string, refundAmount: string): Promise<{ status: 'success' | 'failure'; errorMessage?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful refund
    return {
      status: 'success'
    };
  }

  // Helper method to validate Turkish identity number
  static validateTCKN(tckn: string): boolean {
    if (!tckn || tckn.length !== 11) return false;
    if (!/^\d{11}$/.test(tckn)) return false;
    if (tckn[0] === '0') return false;

    const digits = tckn.split('').map(Number);
    const checkSum = digits.slice(0, 10).reduce((sum, digit, index) => {
      return sum + digit * (index % 2 === 0 ? 1 : 3);
    }, 0);

    return checkSum % 10 === digits[10];
  }

  // Helper method to format Turkish phone number
  static formatTurkishPhone(phone: string): string {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing
    if (cleaned.length === 10 && cleaned.startsWith('5')) {
      return '+90' + cleaned;
    }
    if (cleaned.length === 11 && cleaned.startsWith('05')) {
      return '+90' + cleaned.substring(1);
    }
    if (cleaned.length === 13 && cleaned.startsWith('905')) {
      return '+' + cleaned;
    }
    
    return phone; // Return original if can't format
  }

  // Helper method to generate basket items for subscription
  static generateSubscriptionBasketItem(planName: string, price: string): IyzicoBasketItem {
    return {
      id: `subscription_${Date.now()}`,
      name: `BilgiBite ${planName}`,
      category1: 'Education',
      category2: 'Online Learning',
      itemType: 'VIRTUAL',
      price: price
    };
  }
}

// Export default configuration for development
export const defaultIyzicoConfig: IyzicoConfig = {
  apiKey: process.env.IYZICO_API_KEY || 'mock-api-key',
  secretKey: process.env.IYZICO_SECRET_KEY || 'mock-secret-key',
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.iyzipay.com' 
    : 'https://sandbox-api.iyzipay.com'
};

// Export singleton instance
export const iyzicoService = new IyzicoService(defaultIyzicoConfig);