import { getJwtPayload } from "@/app/actions/jwt";
import { getCurrentUser } from "@/app/queries/user";
import prisma from "@/app/services/prisma";
import { sendBonk } from "@/app/utils/claim";
import * as Sentry from "@sentry/nextjs";
import { Keypair } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import base58 from "bs58";

import { UserAllowlistError } from "./error";

export async function calculateTotalPrizeTokens(
  userId: string,
  tokenAddress: string,
) {
  const result = (await prisma.$queryRaw`
    SELECT SUM(CAST(amount AS NUMERIC)) FROM
      "MysteryBoxPrize" mbp
      LEFT JOIN
      "MysteryBox" mb
      ON mbp."mysteryBoxId" = mb."id"
      WHERE mb."userId" = ${userId}
      AND mbp."prizeType" = 'Token'
      AND mbp."status" = 'Claimed'
      AND mbp."tokenAddress" = ${tokenAddress}
    `) as { sum: number }[];

  return result?.[0]?.sum ?? 0;
}

export async function sendBonkFromTreasury(
  rewardAmount: number,
  address: string,
) {
  const treasuryWallet = Keypair.fromSecretKey(
    base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY || ""),
  );

  if (rewardAmount > 0) {
    const sendTx = await sendBonk(
      treasuryWallet,
      new PublicKey(address),
      Math.round(rewardAmount * 10 ** 5),
    );

    return sendTx;
  }

  return null;
}

export async function isUserInAllowlist(): Promise<boolean> {
  const payload = await getJwtPayload();

  if (!payload) {
    return false;
  }

  const user = await getCurrentUser();

  try {
    const allowlist = await prisma.mysteryBoxAllowlist.findFirst({
      where: {
        address: {
          in: user?.wallets.map((wallet) => wallet.address) || [],
        },
      },
    });

    return !!allowlist;
  } catch (error) {
    const checkUserInAllowlistError = new UserAllowlistError(
      `Failed to check if user with id: ${payload.sub} is in the allowlist`,
      { cause: error },
    );
    Sentry.captureException(checkUserInAllowlistError);
    return false;
  }
}
