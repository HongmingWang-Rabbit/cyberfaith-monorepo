import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "destructive", "outline", "ghost", "neon"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { children: "Get Reading", variant: "default" } };
export const Secondary: Story = { args: { children: "Cancel", variant: "secondary" } };
export const Destructive: Story = { args: { children: "Delete Account", variant: "destructive" } };
export const Outline: Story = { args: { children: "View Profile", variant: "outline" } };
export const Ghost: Story = { args: { children: "Skip", variant: "ghost" } };
export const Neon: Story = { args: { children: "✨ Unlock Premium", variant: "neon" } };
export const Small: Story = { args: { children: "SM", variant: "default", size: "sm" } };
export const Large: Story = { args: { children: "Start Journey", variant: "default", size: "lg" } };
export const Disabled: Story = { args: { children: "Disabled", variant: "default", disabled: true } };
