import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0c",
        graphite: "#18181a",
        steel: "#3a3b3e",
        platinum: "#c9cacd",
        ivory: "#f1eee7",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
