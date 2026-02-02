import type { Preview } from "@storybook/react";
import "../src/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0a0a1a" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
};

export default preview;
