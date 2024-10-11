import prisma from "../services/prisma";
import { authGuard } from "../utils/auth";
import { filterQuestionsByMinimalNumberOfAnswers } from "../utils/question";

export type HistoryResult = {
  id: number;
  image: string | null;
  revealAtDate: Date | null;
  deck: string;
  numberOfQuestionsInDeck: number;
  answeredQuestions: number;
  claimedQuestions: number;
  revealedQuestions: number;
  claimableQuestions: number;
  claimedAmount: number | null;
};

export type QuestionHistory = {
  id: number;
  question: string;
  revealAtDate: Date;
  isAnswered: boolean;
  isClaimed: boolean;
  isRevealed: boolean;
  isClaimable: boolean;
  isRevealable: boolean;
  claimedAmount?: number;
  revealTokenAmount: number;
  burnTransactionSignature?: string;
  answerCount: number;
  image?: string;
};

export async function getDecksHistory(
  userId: string,
): Promise<HistoryResult[]> {
  const decksHistory: HistoryResult[] = await prisma.$queryRaw`
		SELECT 
			d.id,
			c.image,
			d."revealAtDate",
			d.deck, 
			COUNT(DISTINCT dq."questionId") AS "numberOfQuestionsInDeck", 
			COUNT(DISTINCT CASE WHEN qa.selected = true THEN qa."questionOptionId" END) AS "answeredQuestions",
			COUNT(DISTINCT CASE WHEN cr."result" = 'Claimed'::public."ResultType" AND cr."rewardTokenAmount" > 0 THEN cr."questionId" END) AS "claimedQuestions",
			COUNT(DISTINCT CASE WHEN cr."result" = 'Revealed'::public."ResultType" OR cr."result" = 'Claimed'::public."ResultType" THEN cr."questionId" END) AS "revealedQuestions",
			COUNT(DISTINCT CASE WHEN cr."result" = 'Revealed'::public."ResultType" AND cr."rewardTokenAmount" > 0 THEN cr."questionId" END) AS "claimableQuestions",
			SUM(CASE WHEN cr."result" = 'Claimed'::public."ResultType" THEN cr."rewardTokenAmount" END) AS "claimedAmount"
		FROM public."DeckQuestion" dq 
		JOIN public."Deck" d ON d.id = dq."deckId" 
		JOIN public."Question" q ON q.id = dq."questionId"
		JOIN public."QuestionOption" qo ON qo."questionId" = q.id
		LEFT JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id AND qa."userId" = '${userId}'
		LEFT JOIN public."ChompResult" cr ON cr."questionId" = q.id AND cr."userId" = '${userId}' AND cr."questionId" IS NOT NULL
		LEFT JOIN public."Stack" c ON c.id = d."stackId"
		WHERE d."revealAtDate" IS NOT NULL 
		GROUP BY d.deck, d.id, c.image, d."revealAtDate"
		ORDER BY d."revealAtDate" DESC
		`;

  return decksHistory;
}

export async function getQuestionsHistoryQuery(
  userId: string,
  pageSize: number,
  currentPage: number,
  deckId?: string,
): Promise<QuestionHistory[]> {
  const offset = (currentPage - 1) * pageSize;

  const deckHistoryCondition: string = `AND dq."deckId" = ${deckId}`;

  const query = `
  SELECT 
    q.id, 
    q.question,
    q."revealAtDate",
    cr."rewardTokenAmount" as "claimedAmount",
    cr."burnTransactionSignature",
    c."image",
    q."revealTokenAmount",
    CASE 
      WHEN COUNT(CASE WHEN qa.selected = true THEN 1 ELSE NULL END) > 0 THEN true
      ELSE false 
    END AS "isAnswered",
    CASE 
      WHEN COUNT(CASE WHEN cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) > 0 THEN true
      ELSE false 
    END AS "isClaimed",
    CASE 
      WHEN COUNT(CASE WHEN (cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0) OR (cr.result = 'Revealed' AND cr."transactionStatus" = 'Completed') THEN 1 ELSE NULL END) > 0 THEN true
      ELSE false 
    END AS "isRevealed",
    CASE 
      WHEN COUNT(CASE WHEN cr.result = 'Revealed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) > 0
          AND COUNT(CASE WHEN cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) = 0 THEN true
      ELSE false 
    END AS "isClaimable",
    CASE 
      WHEN COUNT(CASE WHEN cr.result = 'Claimed' OR (cr.result = 'Revealed' AND cr."transactionStatus" = 'Completed') THEN 1 ELSE NULL END) = 0
          AND q."revealAtDate" < NOW() THEN true
      ELSE false 
    END AS "isRevealable"
  FROM 
    public."Question" q 
  JOIN 
    public."QuestionOption" qo ON qo."questionId" = q.id 
  LEFT JOIN 
    public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id AND qa."userId" = '${userId}'
  LEFT JOIN 
    public."ChompResult" cr ON cr."questionId" = q.id AND cr."userId" = '${userId}' AND cr."questionId" IS NOT NULL
  FULL JOIN public."Stack" c on c.id = q."stackId"
  JOIN public."DeckQuestion" dq ON dq."questionId" = q.id
  WHERE 
    q."revealAtDate" IS NOT NULL ${deckId ? deckHistoryCondition : ""}
  GROUP BY 
    q.id, cr."rewardTokenAmount", cr."burnTransactionSignature", c."image"
  HAVING 
    (
      SELECT COUNT(distinct concat(qa."userId", qo."questionId"))
      FROM public."QuestionOption" qo
      JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
      WHERE qo."questionId" = q."id"
    ) >= ${Number(process.env.MINIMAL_ANSWERS_PER_QUESTION)}
  ORDER BY q."revealAtDate" DESC, q."id"
  LIMIT ${pageSize} OFFSET ${offset}
`;

  const historyResult: QuestionHistory[] = await prisma.$queryRawUnsafe(query);

  return historyResult.map((hr) => ({
    ...hr,
    claimedAmount: Math.trunc(Number(hr.claimedAmount)),
    revealTokenAmount: Number(hr.revealTokenAmount),
  }));
}

export async function getAllQuestionsReadyForReveal(): Promise<
  { id: number; revealTokenAmount: number; question: string }[]
> {
  const payload = await authGuard();

  const userId = payload.sub;

  const questions = await prisma.$queryRawUnsafe<
    {
      id: number;
      revealTokenAmount: number;
      answerCount: number;
      question: string;
    }[]
  >(
    `
		SELECT 
    q.id,
    q.question,
    CASE 
        WHEN cr."transactionStatus" = 'Completed' OR cr."transactionStatus" = 'Pending' THEN 0
        ELSE q."revealTokenAmount"
    END AS "revealTokenAmount",
    (
        SELECT
            COUNT(DISTINCT CONCAT(qa."userId", qo."questionId"))
        FROM 
            public."QuestionOption" qo
        JOIN 
            public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
        WHERE 
            qo."questionId" = q."id"
    ) AS "answerCount"
FROM 
    public."Question" q
LEFT JOIN 
    public."ChompResult" cr ON cr."questionId" = q.id
    AND cr."userId" = '${userId}'
    AND cr."transactionStatus" IN ('Completed', 'Pending')
JOIN 
    public."QuestionOption" qo ON q.id = qo."questionId"
JOIN 
    public."QuestionAnswer" qa ON qo.id = qa."questionOptionId"
WHERE 
    (cr."transactionStatus" IS NULL OR cr."transactionStatus" != 'Completed')
    AND q."revealAtDate" IS NOT NULL
    AND q."revealAtDate" < NOW()
    AND qa.selected = TRUE
    AND qa."userId" = '${userId}';
	`,
  );

  return filterQuestionsByMinimalNumberOfAnswers(questions);
}

export async function getAllDeckQuestionsReadyForReveal(
  deckId: number,
): Promise<{ id: number; revealTokenAmount: number; question: string }[]> {
  const payload = await authGuard();

  const userId = payload.sub;

  const questions = await prisma.$queryRawUnsafe<
    {
      id: number;
      revealTokenAmount: number;
      answerCount: number;
      question: string;
    }[]
  >(
    `
		SELECT 
    q.id,
    q.question,
    CASE 
        WHEN cr."transactionStatus" = 'Completed' OR cr."transactionStatus" = 'Pending' THEN 0
        ELSE q."revealTokenAmount"
    END AS "revealTokenAmount",
    (
        SELECT
            COUNT(DISTINCT CONCAT(qa."userId", qo."questionId"))
        FROM 
            public."QuestionOption" qo
        JOIN 
            public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
        WHERE 
            qo."questionId" = q."id"
    ) AS "answerCount",
     dc."deckId" as "deckId"
FROM 
    public."Question" q
LEFT JOIN 
    "ChompResult" cr ON cr."questionId" = q.id
    AND cr."userId" = '${userId}'
    AND cr."transactionStatus" IN ('Completed', 'Pending')
JOIN 
    "QuestionOption" qo ON q.id = qo."questionId"
JOIN 
    "QuestionAnswer" qa ON qo.id = qa."questionOptionId"
JOIN "DeckQuestion" dc ON q.id = dc."questionId"
WHERE 
    (cr."transactionStatus" IS NULL OR cr."transactionStatus" != 'Completed')
    AND q."revealAtDate" IS NOT NULL
    AND q."revealAtDate" < NOW()
    AND qa.selected = TRUE
    AND qa."userId" = '${userId}'
    AND dc."deckId" = ${deckId};
	`,
  );

  return filterQuestionsByMinimalNumberOfAnswers(questions);
}
