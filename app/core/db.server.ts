import { PrismaClient } from "../../generated/prisma"

declare global {
  var prismaClient: PrismaClient | undefined
}

export const db = (globalThis.prismaClient ??= new PrismaClient())
