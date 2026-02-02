import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../components/badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "accent", "highlight"] },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: "Aries ♈" } };
export const Secondary: Story = { args: { children: "Free Tier", variant: "secondary" } };
export const Accent: Story = { args: { children: "INTJ", variant: "accent" } };
export const Highlight: Story = { args: { children: "🔥 Streak: 7", variant: "highlight" } };
