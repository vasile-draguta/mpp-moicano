import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tests = await prisma.test.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  return NextResponse.json({ tests });
}

export const GET = async () => {
  return main();
};
