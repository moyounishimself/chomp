"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../Icons/ArrowLeftIcon";

const CampaignsHeader = () => {
  const router = useRouter();
  return (
    <header className="flex items-center gap-2">
      <div className="cursor-pointer" onClick={() => router.back()}>
        <ArrowLeftIcon />
      </div>
      <h2 className="text-xl font-bold text-white">Campaigns</h2>
    </header>
  );
};

export default CampaignsHeader;
