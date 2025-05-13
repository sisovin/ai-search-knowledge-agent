import { withThemeByClassName } from "@storybook/addon-styling";
import type { Preview } from "@storybook/react";
import "../app/globals.css";
import "../app/language-styles.css";
import "../app/theme-styles.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#1a202c",
        },
      ],
    },
  },
  decorators: [
    // Add Tailwind dark mode support
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
};

export default preview;
