export interface InitializePaymentResponse {
  paymentId: string;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: number;
  clientFee: number;
  totalClientCharge: number;
}

export interface PaymentVerification {
  payment: {
    _id: string;
    reference: string;
    status: string;
    amount: number;
    clientFee: number;
    freelancerNetAmount: number;
  };

  transaction: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    id: number;
  };
}