/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",
        secondary: "#0ea5e9",
        accent: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e",
      },
    },
  },
  plugins: [],
}

