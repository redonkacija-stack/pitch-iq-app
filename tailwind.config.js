/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#020617",
        panel: "#0f172a",
        pitch: "#064e3b",
        lime: "#10b981",
        mist: "#94a3b8",
      },
      fontFamily: {
        display: ["Barlow Condensed", "Arial Narrow", "sans-serif"],
        sans: ["DM Sans", "Segoe UI", "sans-serif"],
      },
      boxShadow: { glow: "0 0 32px rgba(16, 185, 129, 0.2)" },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(.88) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "shake-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-5px)" },
          "40%, 80%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        "pop-in": "pop-in .32s cubic-bezier(.2,.8,.2,1) both",
        "shake-x": "shake-x .32s ease-in-out",
      },
    },
  },
  plugins: [],
};
