import {
  getMyFungibleAssetBalances,
  getTransactionHistory,
} from "@/app/actions/fungible-asset";
import { getJwtPayload } from "@/app/actions/jwt";
import { TransactionProfile } from "@/app/components/TransactionProfile/TransactionProfile";
import { TransactionsBackButton } from "@/app/components/TransactionsBackButton/TransactionsBackButton";
import { TransactionsTable } from "@/app/components/TransactionsTable/TransactionsTable";
import { WalletWidget } from "@/app/components/WalletWidget/WalletWidget";
import AvatarPlaceholder from "../../../public/images/avatar_placeholder.png";

type PageProps = {};

export default async function Page({}: PageProps) {
  const balances = await getMyFungibleAssetBalances();
  const history = await getTransactionHistory();
  const payload = await getJwtPayload();

  return (
    <div className="w-full h-full bg-[#4D4D4D] p-4">
      <TransactionProfile
        avatarSrc={AvatarPlaceholder.src}
        pointAmount={balances.Point}
      />
      <div className="mt-4">
        <WalletWidget
          address={
            payload?.verified_credentials.find(
              (vc) => vc.format === "blockchain",
            )?.address ?? ""
          }
        />
      </div>
      <TransactionsTable
        className="my-4 h-[calc(100%-270px)]"
        transactions={history.map((h) => ({
          amount: h.change.toNumber(),
          amountLabel: h.asset,
          transactionType: h.type,
          date: h.createdAt,
          dollarAmount: 0,
        }))}
      />
      <TransactionsBackButton />
    </div>
  );
}
