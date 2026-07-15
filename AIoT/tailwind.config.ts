import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E1A2B",
        teal: "#0FB9B1",
        cyan: "#34D1E7",
        mint: "#A0F0D0",
        coral: "#FF7A59",
        glass: "rgba(255,255,255,0.14)"
      },
      boxShadow: {
        glow: "0 10px 40px rgba(15, 185, 177, 0.22)",
        panel: "0 12px 30px rgba(10, 25, 45, 0.35)"
      },
      backdropBlur: {
        xs: "2px"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseLine: "pulseLine 2.2s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
