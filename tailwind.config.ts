import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A1A1A",
        surface: "#FAFAFA",
        border: "#E5E5E5",
        muted: "#999999",
      },
    },
  },
  plugins: [],
};
export default config;
