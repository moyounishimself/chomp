"use server";

import {
  ChompResult,
  Deck,
  DeckQuestion,
  Question,
  QuestionAnswer,
  QuestionOption,
} from "@prisma/client";
import { isAfter, isBefore } from "date-fns";
import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";

export async function getCampaigns() {
  return prisma.campaign.findMany({
    where: {
      isVisible: true,
      isActive: true,
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function getCampaign(id: number) {
  return prisma.campaign.findUnique({
    where: {
      id,
      isVisible: true,
      isActive: true,
    },
    include: {
      deck: true,
    },
  });
}

export async function getAllCampaigns() {
  const payload = await getJwtPayload();

  const userId = payload?.sub;

  const campaigns = await prisma.campaign.findMany({
    include: {
      deck: {
        include: {
          deckQuestions: {
            include: {
              question: {
                include: {
                  chompResults: {
                    where: {
                      userId,
                    },
                  },
                  questionOptions: {
                    include: {
                      questionAnswers: {
                        where: {
                          userId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return campaigns.map((campaign) => ({
    ...campaign,
    decksToAnswer: !!userId ? getDecksToAnswer(campaign.deck) : undefined,
    decksToReveal: !!userId ? getDecksToReveal(campaign.deck) : undefined,
  }));
}

function getDecksToAnswer(
  decks: (Deck & {
    deckQuestions: (DeckQuestion & {
      question: Question & {
        questionOptions: (QuestionOption & {
          questionAnswers: QuestionAnswer[];
        })[];
      };
    })[];
  })[],
) {
  return decks.filter(
    (deck) =>
      isBefore(deck.activeFromDate!, new Date()) &&
      isAfter(deck.revealAtDate!, new Date()) &&
      deck.deckQuestions.flatMap((dq) => dq.question.questionOptions).length !==
        deck.deckQuestions.flatMap((dq) =>
          dq.question.questionOptions.flatMap((qo) => qo.questionAnswers),
        ).length,
  );
}

function getDecksToReveal(
  decks: (Deck & {
    deckQuestions: (DeckQuestion & {
      question: Question & {
        chompResults: ChompResult[];
      };
    })[];
  })[],
) {
  return decks.filter(
    (deck) =>
      isAfter(new Date(), deck.revealAtDate!) &&
      deck.deckQuestions.map((dq) => dq.question).length !==
        deck.deckQuestions.flatMap((dq) =>
          dq.question.chompResults.map((cr) => cr),
        ).length,
  );
}
