import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "../components/progress-bar";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  argTypes: {
    variant: { control: "select", options: ["primary", "accent", "highlight"] },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
  decorators: [(Story) => <div style={{ width: 300 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Primary: Story = { args: { value: 65, variant: "primary" } };
export const Accent: Story = { args: { value: 40, variant: "accent" } };
export const Highlight: Story = { args: { value: 85, variant: "highlight" } };
export const Empty: Story = { args: { value: 0 } };
export const Full: Story = { args: { value: 100 } };
