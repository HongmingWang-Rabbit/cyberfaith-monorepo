import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card style={{ maxWidth: 400 }}>
      <CardHeader>
        <CardTitle>Daily Tarot</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The Tower — A card of sudden change and revelation.</p>
      </CardContent>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card style={{ maxWidth: 300, padding: 16 }}>
      <p>Simple card content</p>
    </Card>
  ),
};
