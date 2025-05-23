"use client";

import { addUserSocials } from "@/app/actions/addUserSocials";
import { addTelegramPoints, addXPoints } from "@/app/actions/fungible-asset";
import { useToast } from "@/app/providers/ToastProvider";
import { ProviderEnum } from "@dynamic-labs/sdk-api-core";
import {
  useDynamicContext,
  useSocialAccounts,
} from "@dynamic-labs/sdk-react-core";
import { SocialAccountInformation } from "@dynamic-labs/types";
import { useEffect, useState } from "react";

import DisconnectSocial from "../DisconnectSocial/DisconnectSocial";
import TelegramIconBlue from "../Icons/TelegramIconBlue";
import XIconWhite from "../Icons/XIconWhite";
import Spinner from "../Spinner/Spinner";
import { Button } from "../ui/button";

export function SocialAuth() {
  const { errorToast } = useToast();

  const [userTwitterInfo, setUserTwitterInfo] =
    useState<SocialAccountInformation | null>();
  const [userTelegramInfo, setUserTelegramInfo] =
    useState<SocialAccountInformation | null>();

  const { sdkHasLoaded, primaryWallet } = useDynamicContext();
  const {
    linkSocialAccount,
    unlinkSocialAccount,
    getLinkedAccountInformation,
    error,
    isLinked,
  } = useSocialAccounts();

  useEffect(() => {
    const twitterInfo = getLinkedAccountInformation(ProviderEnum.Twitter);
    setUserTwitterInfo(twitterInfo);
    if (!!twitterInfo) addXPoints();

    const telegramInfo = getLinkedAccountInformation(ProviderEnum.Telegram);
    setUserTelegramInfo(telegramInfo);
    if (!!telegramInfo) addTelegramPoints();

    addUserSocials(
      twitterInfo?.username ?? null,
      telegramInfo?.username ?? null,
    );
    if (error) {
      errorToast("Could not connect account", error.message);
    }
  }, [sdkHasLoaded, isLinked, error]);

  if (!sdkHasLoaded) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col gap-4">
      {userTwitterInfo ? (
        <DisconnectSocial
          icon={<XIconWhite width={14} height={14} />}
          username={userTwitterInfo?.username}
          disconnectHandler={async () => {
            await unlinkSocialAccount(ProviderEnum.Twitter);
            setUserTwitterInfo(null);
          }}
          socialName="X"
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            await linkSocialAccount(ProviderEnum.Twitter);
          }}
          className="bg-gray-700 hover:bg-gray-700"
        >
          <XIconWhite width={14} height={14} />
          <p className="pl-4">Connect X for 20 points</p>
        </Button>
      )}
      {userTelegramInfo ? (
        <DisconnectSocial
          icon={<TelegramIconBlue width={24} height={24} />}
          username={userTelegramInfo?.username}
          disconnectHandler={async () => {
            if (primaryWallet?.connector.isEmbeddedWallet) {
              errorToast("Cannot unlink primary connection method");
              return;
            }
            await unlinkSocialAccount(ProviderEnum.Telegram);
            setUserTelegramInfo(null);
          }}
          socialName="Telegram"
        />
      ) : (
        <Button
          type="button"
          onClick={async () => {
            await linkSocialAccount(ProviderEnum.Telegram);
          }}
          className="bg-gray-700 hover:bg-gray-700"
        >
          <TelegramIconBlue width={24} height={24} />
          <p className="pl-4">Connect Telegram for 20 points</p>
        </Button>
      )}
    </div>
  );
}
