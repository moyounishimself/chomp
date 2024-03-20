import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { cookies } from "next/headers";
import { getJwtPayload } from "./auth";
import prisma from "@/app/services/prisma";

export const findSplTokenPda = (
  pubKey: PublicKey,
  tokenMintAddress: PublicKey
): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [
      pubKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      tokenMintAddress.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
};

const tokenAddresses = {
  bonk: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
};

export const getTokenBalances = async (addr: string | string[]) => {
  const walletAddresses = typeof addr === "string" ? [addr] : addr;
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "");

  const tokenBalances = {
    bonk: 0,
  };

  for (const [token, tokenAddress] of Object.entries(tokenAddresses)) {
    for (const walletAddress of walletAddresses) {
      const tokenAccount = findSplTokenPda(
        new PublicKey(walletAddress),
        new PublicKey(tokenAddress)
      );

      const tokenAccountBalance =
        await connection.getTokenAccountBalance(tokenAccount);

      tokenBalances[token as keyof typeof tokenAddresses] +=
        tokenAccountBalance.value.uiAmount ?? 0;
    }
  }

  return tokenBalances;
};

export const getUserTokenBalances = async () => {
  const user = await getJwtPayload();

  if (!user) {
    return { bonk: 0 };
  }

  const wallets = await prisma.wallet.findMany({
    where: {
      userId: user.sub,
    },
  });

  return getTokenBalances(wallets.map((wallet) => wallet.address));
};
