import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import { getValidationRewardQuestions } from "@/app/queries/getValidationRewardQuestion";
import MysteryBoxHub from "@/components/MysteryBox/MysteryBoxHub";

async function Page() {
  const CREDIT_COST_FEATURE_FLAG =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

  if (CREDIT_COST_FEATURE_FLAG) {
    const [validationRewardQuestions] = await Promise.all([
      getValidationRewardQuestions(),
    ]);

    const isUserEligibleForValidationReward: boolean =
      !!validationRewardQuestions && validationRewardQuestions.length > 0;

    return (
      <div className="mb-6">
        <ProfileNavigation />
        <MysteryBoxHub
          isUserEligibleForValidationReward={isUserEligibleForValidationReward}
        />
      </div>
    );
  } else {
    throw new Error("Content Unavailable");
  }
}

export default Page;
