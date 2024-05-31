import AnsweredQuestionShow from "@/app/components/AnsweredQuestionShow/AnsweredQuestionShow";
import { HalfArrowLeftIcon } from "@/app/components/Icons/HalfArrowLeftIcon";
import TopInfoBox from "@/app/components/InfoBoxes/RevealPage/TopInfoBox";
import RewardShow from "@/app/components/RewardShow/RewardShow";
import { getQuestionWithUserAnswer } from "@/app/queries/question";
import { isEntityRevealable } from "@/app/utils/question";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: {
    questionId: string;
  };
}

const RevealAnswerPage = async ({ params }: Props) => {
  const question = await getQuestionWithUserAnswer(Number(params.questionId));

  if (!question) notFound();

  const isQuestionRevealable = isEntityRevealable({
    revealAtAnswerCount: question.revealAtAnswerCount,
    revealAtDate: question.revealAtDate,
    answerCount: question.questionOptions[0].questionAnswers.length,
  });

  if (!isQuestionRevealable) redirect("/application");

  return (
    <div className="py-2 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 justify-start">
          <Link href="/application">
            <HalfArrowLeftIcon />
          </Link>
          <h4 className="text-[13px] font-normal leading-[13px] text-left">
            Viewing answer results
          </h4>
        </div>
        <TopInfoBox />
      </div>
      <RewardShow rewardAmount={10000} />
      <AnsweredQuestionShow question={question} />
    </div>
  );
};

export default RevealAnswerPage;
