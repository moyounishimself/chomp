import { ReactElement, cloneElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { HomeIcon } from "../app/components/Icons/HomeIcon";
import { CommunityIcon } from "../app/components/Icons/CommunityIcon";
import { ProfileIcon } from "../app/components/Icons/ProfileIcon";
import { QuestIcon } from "../app/components/Icons/QuestIcon";
import { CloseIcon } from "../app/components/Icons/CloseIcon";
import { BackIcon } from "../app/components/Icons/BackIcon";
import { BookmarkIcon } from "../app/components/Icons/BookmarkIcon";
import { BookmarkFilled } from "../app/components/Icons/BookmarkFilled";
import { ThumbsEmptyIcon } from "../app/components/Icons/ThumbsEmptyIcon";
import { ThumbsFilledIcon } from "../app/components/Icons/ThumbsFilledIcon";
import { SettingsIcon } from "../app/components/Icons/SettingsIcon";
import { AddIcon } from "../app/components/Icons/AddIcon";
import { ClockIcon } from "../app/components/Icons/ClockIcon";
import { TrendingIcon } from "../app/components/Icons/TrendingIcon";
import { AddNotificationIcon } from "../app/components/Icons/AddNotificationIcon";
import { HalfArrowDownIcon } from "../app/components/Icons/HalfArrowDownIcon";
import { HalfArrowUpIcon } from "../app/components/Icons/HalfArrowUpIcon";
import { HalfArrowLeftIcon } from "../app/components/Icons/HalfArrowLeftIcon";
import { HalfArrowRightIcon } from "../app/components/Icons/HalfArrowRightIcon";
import { MoneyIcon } from "../app/components/Icons/MoneyIcon";
import { ViewsIcon } from "../app/components/Icons/ViewsIcon";
import { ComposeIcon } from "../app/components/Icons/ComposeIcon";
import { ChallengeIcon } from "../app/components/Icons/ChallengeIcon";
import { SearchIcon } from "../app/components/Icons/SearchIcon";
import { FilterIcon } from "../app/components/Icons/FilterIcon";
import { SettingsSlidersIcon } from "../app/components/Icons/SettingsSlidersIcon";
import { CommentIcon } from "../app/components/Icons/CommentIcon";
import { InfoIcon } from "../app/components/Icons/InfoIcon";
import { NotificationIcon } from "../app/components/Icons/NotificationIcon";
import { UnreadIcon } from "../app/components/Icons/UnreadIcon";
import { OpenLinkIcon } from "../app/components/Icons/OpenLinkIcon";
import { CheckboxEmptyIcon } from "../app/components/Icons/CheckboxEmptyIcon";
import { CheckboxCheckedIcon } from "../app/components/Icons/CheckboxCheckedIcon";
import { DragHandleIcon } from "../app/components/Icons/DragHandleIcon";
import { ShareIcon } from "../app/components/Icons/ShareIcon";
import { HistoryIcon } from "../app/components/Icons/HistoryIcon";
import { SortByIcon } from "../app/components/Icons/SortByIcon";
import { CountdownIcon } from "../app/components/Icons/CountdownIcon";
import { ImageIcon } from "../app/components/Icons/ImageIcon";
import { PercentageIcon } from "../app/components/Icons/PercentageIcon";
import { AnswerResultIcon } from "../app/components/Icons/AnswerResultIcon";
import { WalletIcon } from "../app/components/Icons/WalletIcon";

const IconWrapper = ({
  icon,
  fill,
  width,
  height,
}: {
  icon: ReactElement;
  fill?: string;
  width?: number;
  height?: number;
}) => {
  return <div>{cloneElement(icon, { fill, width, height })}</div>;
};

const meta = {
  title: "Icons",
  component: IconWrapper,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["icon"],
    },
  },
  tags: ["autodocs"],
  args: {
    fill: "#000",
    width: 40,
    height: 40,
  },
  argTypes: {
    fill: { control: { type: "color" } },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<typeof IconWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: {
    icon: <HomeIcon />,
  },
};

export const Community: Story = {
  args: {
    icon: <CommunityIcon />,
  },
};

export const Profile: Story = {
  args: {
    icon: <ProfileIcon />,
  },
};

export const Quest: Story = {
  args: {
    icon: <QuestIcon />,
  },
};

export const Close: Story = {
  args: {
    icon: <CloseIcon />,
  },
};

export const Back: Story = {
  args: {
    icon: <BackIcon />,
  },
};

export const Bookmark: Story = {
  args: {
    icon: <BookmarkIcon />,
  },
};

export const BookmarkFilledIcon: Story = {
  args: {
    icon: <BookmarkFilled />,
  },
};

export const ThumbsEmpty: Story = {
  args: {
    icon: <ThumbsEmptyIcon />,
  },
};

export const ThumbsFilled: Story = {
  args: {
    icon: <ThumbsFilledIcon />,
  },
};

export const Settings: Story = {
  args: {
    icon: <SettingsIcon />,
  },
};

export const Add: Story = {
  args: {
    icon: <AddIcon />,
  },
};

export const Clock: Story = {
  args: {
    icon: <ClockIcon />,
  },
};

export const Trending: Story = {
  args: {
    icon: <TrendingIcon />,
  },
};

export const AddNotification: Story = {
  args: {
    icon: <AddNotificationIcon />,
  },
};

export const HalfArrowDown: Story = {
  args: {
    icon: <HalfArrowDownIcon />,
  },
};

export const HalfArrowUp: Story = {
  args: {
    icon: <HalfArrowUpIcon />,
  },
};

export const HalfArrowLeft: Story = {
  args: {
    icon: <HalfArrowLeftIcon />,
  },
};

export const HalfArrowRight: Story = {
  args: {
    icon: <HalfArrowRightIcon />,
  },
};

export const Money: Story = {
  args: {
    icon: <MoneyIcon />,
  },
};

export const Views: Story = {
  args: {
    icon: <ViewsIcon />,
  },
};

export const Compose: Story = {
  args: {
    icon: <ComposeIcon />,
  },
};

export const Challenge: Story = {
  args: {
    icon: <ChallengeIcon />,
  },
};

export const Search: Story = {
  args: {
    icon: <SearchIcon />,
  },
};

export const Filter: Story = {
  args: {
    icon: <FilterIcon />,
  },
};

export const SettingsSliders: Story = {
  args: {
    icon: <SettingsSlidersIcon />,
  },
};

export const Comment: Story = {
  args: {
    icon: <CommentIcon />,
  },
};

export const Info: Story = {
  args: {
    icon: <InfoIcon />,
  },
};

export const Notification: Story = {
  args: {
    icon: <NotificationIcon />,
  },
};

export const Unread: Story = {
  args: {
    icon: <UnreadIcon />,
  },
};

export const OpenLink: Story = {
  args: {
    icon: <OpenLinkIcon />,
  },
};

export const CheckboxEmpty: Story = {
  args: {
    icon: <CheckboxEmptyIcon />,
  },
};

export const CheckboxChecked: Story = {
  args: {
    icon: <CheckboxCheckedIcon />,
  },
};

export const DragHandle: Story = {
  args: {
    icon: <DragHandleIcon />,
  },
};

export const Share: Story = {
  args: {
    icon: <ShareIcon />,
  },
};

export const History: Story = {
  args: {
    icon: <HistoryIcon />,
  },
};

export const SortBy: Story = {
  args: {
    icon: <SortByIcon />,
  },
};

export const Countdown: Story = {
  args: {
    icon: <CountdownIcon />,
  },
};

export const Image: Story = {
  args: {
    icon: <ImageIcon />,
  },
};

export const Percentage: Story = {
  args: {
    icon: <PercentageIcon />,
  },
};

export const AnswerResult: Story = {
  args: {
    icon: <AnswerResultIcon />,
  },
};

export const Wallet: Story = {
  args: {
    icon: <WalletIcon />,
  },
};