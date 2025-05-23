import { getTotalClaimableRewards } from "@/app/actions/history";
import History from "@/app/components/History/History";
import HistoryHeader from "@/app/components/HistoryHeader/HistoryHeader";
import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import { getAllQuestionsReadyForReveal } from "@/app/queries/history";
import { getProfileImage } from "@/app/queries/profile";
import HistoryList from "@/components/HistoryNew/HistoryList";

export default async function Page() {
  const [revealableQuestions, totalClaimableRewards, profileImg] =
    await Promise.all([
      getAllQuestionsReadyForReveal(),
      getTotalClaimableRewards(),
      getProfileImage(),
    ]);

  const FF_CREDITS =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

  return (
    <>
      <div className="flex flex-col gap-4 overflow-hidden">
        <ProfileNavigation />

        {FF_CREDITS ? (
          <>
            <HistoryList />
          </>
        ) : (
          <>
            <HistoryHeader
              totalClaimableRewards={totalClaimableRewards}
              revealableQuestions={revealableQuestions}
              profileImg={profileImg}
            />

            <History />
          </>
        )}
      </div>
    </>
  );
}
