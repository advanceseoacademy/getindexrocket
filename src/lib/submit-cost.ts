import { CREDIT_PER_URL } from "./brand";

export const VERIFICATION_CREDIT_PER_URL = 1;

export type SubmitOptions = {
  smartVerification?: boolean;
  dripFeed?: boolean;
  taskName?: string;
};

export function calculateSubmitCost(urlCount: number, options: SubmitOptions = {}) {
  const indexCost = CREDIT_PER_URL * urlCount;
  const checkCost = options.smartVerification
    ? VERIFICATION_CREDIT_PER_URL * urlCount
    : 0;

  return {
    indexCost,
    checkCost,
    total: indexCost + checkCost,
  };
}
