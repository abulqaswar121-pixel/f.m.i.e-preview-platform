export const MINIMUM_WITHDRAWAL_MINOR = 200_000;

export interface PaystackPaymentFacts {
  status: string;
  reference: string;
  amount: number;
  currency: string;
}

export function isValidWithdrawalAmount(amountMinor: number): boolean {
  return (
    Number.isSafeInteger(amountMinor) &&
    amountMinor >= MINIMUM_WITHDRAWAL_MINOR &&
    amountMinor % 100 === 0
  );
}

export function matchesPaystackPayment(
  payment: PaystackPaymentFacts,
  expected: { reference: string; amountMinor: number; currency: string },
): boolean {
  return (
    payment.status === "success" &&
    payment.reference === expected.reference &&
    payment.amount === expected.amountMinor &&
    payment.currency === expected.currency
  );
}