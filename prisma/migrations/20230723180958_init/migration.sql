-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "discordAccessToken" TEXT NOT NULL,
    "discordRefreshToken" TEXT NOT NULL,
    "discordExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
