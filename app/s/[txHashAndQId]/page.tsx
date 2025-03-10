import { getOgShareClaimSinglePath } from "@/lib/urls";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  params: { txHashAndQId: string };
};

export async function generateMetadata({
  params: { txHashAndQId },
}: Props): Promise<Metadata> {
  const images = [getOgShareClaimSinglePath(txHashAndQId)];

  return {
    openGraph: {
      images,
    },
  };
}

export default async function Page() {
  const headersList = headers();
  const referer = headersList.get("referer");

  redirect(
    `/application?${referer === "x" ? "utm_source=x&utm_medium=social&" : ""}utm_campaign=app_share&utm_content=claim_all`,
  );
}
