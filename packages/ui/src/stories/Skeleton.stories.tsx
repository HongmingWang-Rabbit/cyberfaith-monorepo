import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "../components/skeleton";
import { Card, CardHeader, CardContent } from "../components/card";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Text: Story = { args: { variant: "text" } };
export const Circular: Story = { args: { variant: "circular", width: 48, height: 48 } };
export const Rectangular: Story = { args: { variant: "rectangular", width: 200, height: 120 } };

export const CardLoading: Story = {
  render: () => (
    <Card style={{ maxWidth: 300, padding: 16 }}>
      <CardHeader>
        <Skeleton variant="text" style={{ width: "60%" }} />
      </CardHeader>
      <CardContent>
        <Skeleton variant="text" />
        <Skeleton variant="text" style={{ width: "80%", marginTop: 8 }} />
        <Skeleton variant="text" style={{ width: "40%", marginTop: 8 }} />
      </CardContent>
    </Card>
  ),
};
