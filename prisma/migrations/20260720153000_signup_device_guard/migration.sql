-- CreateTable
CREATE TABLE "SignupDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceHash" TEXT NOT NULL,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignupDevice_userId_key" ON "SignupDevice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SignupDevice_deviceHash_key" ON "SignupDevice"("deviceHash");

-- CreateIndex
CREATE INDEX "SignupDevice_ipHash_createdAt_idx" ON "SignupDevice"("ipHash", "createdAt");

-- AddForeignKey
ALTER TABLE "SignupDevice" ADD CONSTRAINT "SignupDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
