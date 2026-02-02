import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "../components/modal";
import { Button } from "../components/button";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
};
export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <h2 style={{ marginBottom: 8 }}>Confirm Reading</h2>
          <p style={{ marginBottom: 16 }}>Are you ready to receive your cosmic guidance?</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </>
    );
  },
};

export const AlwaysOpen: Story = {
  render: () => (
    <Modal open onClose={() => {}}>
      <h2>Static Modal</h2>
      <p>This modal is always visible in Storybook.</p>
    </Modal>
  ),
};
