import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/react/dist/index.js",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
