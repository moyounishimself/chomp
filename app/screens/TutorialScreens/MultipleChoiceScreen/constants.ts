import { QuestionStep } from "@/types/question";

export const STEPS = [
  {
    text: "Pick the answer you agree with most.",
    style: {
      bottom: "65px",
      left: "0%",
    },
    isQuestionCardTooltip: true,
    position: "bottom-start",
    questionActionStep: QuestionStep.AnswerQuestion,
    isTooltip: true,
  },
  {
    text: "How many people do you think chose this answer?",
    style: {},
    position: "top-start",
    isQuestionCardTooltip: false,
    questionActionStep: QuestionStep.PickPercentage,
    isTooltip: true,
  },
  {
    text: "",
    style: {},
    position: "top",
    isQuestionCardTooltip: false,
    questionActionStep: QuestionStep.PickPercentage,
    isTooltip: false,
  },
];
