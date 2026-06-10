-- Store credits owed when payment arrives before user signup (reconciled on login).
ALTER TABLE "PaymentEvent" ADD COLUMN IF NOT EXISTS "intendedCredits" INTEGER NOT NULL DEFAULT 0;
