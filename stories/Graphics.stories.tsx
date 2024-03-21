import { ReactElement, cloneElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChompGraphic } from "../app/components/Graphics/ChompGraphic";

const GraphicsWrapper = ({
  graphic,
  width,
  height,
}: {
  graphic: ReactElement;
  width?: number;
  height?: number;
}) => {
  return <div>{cloneElement(graphic, { width, height })}</div>;
};

const meta = {
  title: "Graphics",
  component: GraphicsWrapper,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["graphic"],
    },
  },
  tags: ["autodocs"],
  args: {},
  argTypes: {
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<typeof GraphicsWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Chomp: Story = {
  args: {
    graphic: <ChompGraphic />,
  },
};
