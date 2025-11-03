import type { Preview } from '@storybook/react';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0F0F0F',
        },
        {
          name: 'light',
          value: '#FFFFFF',
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-zinc-950 text-white p-4">
        <Story />
      </div>
    ),
  ],
};

export default preview;