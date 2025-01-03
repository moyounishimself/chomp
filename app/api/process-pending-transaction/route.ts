import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import prisma from "@/app/services/prisma";
import { calculateReward } from "@/app/utils/algo";
import { isValidSignature } from "@/app/utils/solana";
import { InvalidBurnTxError, RevealConfirmationError } from "@/lib/error";
import { validateBonkBurned } from "@/lib/validateBonkBurn";
import { TransactionStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { startOfDay, sub } from "date-fns";

/**
 * This API processes pending Chomp results that fall within the range
 * of 1 week to 10 minutes before the current time.
 *
 * Actions performed:
 * 1. Attempts to validate the burn transaction hash.
 * 2. If successful, marks the result as `complete` and adds the reward amount.
 * 3. If unsuccessful, marks the result as `needsManualReview`.
 */

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET || "";

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const currentTime = new Date();
  const oneWeekAgo = sub(currentTime, { days: 7 });

  try {
    // Fetch all pending transactions within specific date range
    const pendingTransactions = await prisma.chompResult.findMany({
      take: 10,
      where: {
        transactionStatus: "Pending",
        createdAt: {
          gte: startOfDay(oneWeekAgo), // Start of the day 7 days ago
        },
        needsManualReview: null,
      },
      include: {
        question: {
          select: {
            revealTokenAmount: true,
          },
        },
      },
    });

    /**
     * Groups the data by `burnTransactionSignature` hash.
     *
     * Example output:
     * {
     *   '2f19a5NWRJtXhQawYRnksXBmhZWCRvPYDqVQvvYrEiD6wrgNzDaDpnTridruZ6qUXc': [
     *     related chomp results
     *   ]
     * }
     */

    const groupedByBurnSignature = pendingTransactions.reduce(
      (groups, transaction) => {
        const { burnTransactionSignature } = transaction;
        if (!burnTransactionSignature) return groups;

        if (!groups[burnTransactionSignature]) {
          groups[burnTransactionSignature] = [];
        }
        groups[burnTransactionSignature].push(transaction);
        return groups;
      },
      {} as Record<string, typeof pendingTransactions>,
    );

    // Process each result with same tx hash
    for (const burnTx in groupedByBurnSignature) {
      const transactions = groupedByBurnSignature[burnTx];

      const userId = transactions[0].userId;

      const revealableQuestionIds = transactions.map(
        (rq) => rq.questionId || 0,
      );
      const wallets = (
        await prisma.wallet.findMany({
          where: {
            userId,
          },
        })
      ).map((wallet) => wallet.address);

      // validate burn tx hash
      const isValid = await validateBonkBurned(burnTx, wallets);

      if (!isValidSignature(burnTx)) {
        const invalidBurnTxError = new InvalidBurnTxError(
          `Invalid burn tx provided for user ${userId}`,
        );
        Sentry.captureException(invalidBurnTxError, {
          extra: {
            questionIds: revealableQuestionIds,
          },
        });
        await Sentry.flush(SENTRY_FLUSH_WAIT);
      }

      if (isValid) {
        /**
         * If the burnTxHash is valid, the previous result will be deleted,
         * a new result will be added with the status set to "completed",
         * and the reward amount will be updated.
         */
        const questionRewards = await calculateReward(
          userId,
          revealableQuestionIds,
        );

        const pendingChompResults = await prisma.chompResult.findMany({
          where: {
            userId: userId,
            questionId: {
              in: revealableQuestionIds,
            },
            burnTransactionSignature: burnTx,
            transactionStatus: TransactionStatus.Pending,
          },
        });

        const updatedRewards = questionRewards.map((reward) => {
          const matchingResult = pendingChompResults.find(
            (result) => result.questionId === reward.questionId,
          );
          return {
            ...reward,
            chompResultId: matchingResult ? matchingResult.id : undefined, // Add id if a match is found
          };
        });

        await Promise.all(
          updatedRewards.map((qr) =>
            prisma.chompResult.update({
              where: {
                id: qr.chompResultId,
                userId: userId,
                questionId: qr.questionId,
                transactionStatus: TransactionStatus.Pending,
                burnTransactionSignature: burnTx,
              },
              data: {
                burnTransactionSignature: burnTx,
                rewardTokenAmount: qr.rewardAmount,
                transactionStatus: TransactionStatus.Completed,
              },
            }),
          ),
        );
      } else {
        /**
         * If the burnTxHash is invalid, result will be updated,
         * needsManualReview will be true
         * transcation status will stay pending
         */
        await prisma.chompResult.updateMany({
          where: {
            burnTransactionSignature: burnTx,
            transactionStatus: TransactionStatus.Pending,
            userId: userId,
          },
          data: {
            needsManualReview: true,
          },
        });
        const revealError = new RevealConfirmationError(
          `Unable to validate tx for User id: ${userId} and (wallet: ${wallets})`,
        );
        Sentry.captureException(revealError, {
          tags: {
            category: "reveal-tx-validation-error",
          },
        });
        await Sentry.flush(SENTRY_FLUSH_WAIT);
      }
    }
    return new Response("Ok", { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
