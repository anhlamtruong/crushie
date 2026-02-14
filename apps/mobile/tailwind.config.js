/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Valentine Primary Palette
        primary: "#f43f5e", // Rose-500
        "primary-light": "#fda4af", // Rose-300
        "primary-dark": "#be123c", // Rose-700
        "primary-foreground": "#ffffff",
        secondary: "#ec4899", // Pink-500
        "secondary-light": "#f9a8d4", // Pink-300
        accent: "#a855f7", // Purple-500
        "accent-light": "#c084fc", // Purple-400

        // Backgrounds
        background: "#0f0a1a", // Deep violet-black
        "background-card": "#1a1128", // Slightly lighter violet
        "background-soft": "#fdf2f8", // Pink-50 for light surfaces
        surface: "#231738", // Mid violet surface

        // Text
        foreground: "#fce7f3", // Pink-100 for main text
        "foreground-muted": "#d4a0b9", // Muted pink
        "foreground-dim": "#8b6b80", // Dimmed text

        // Status
        success: "#34d399", // Emerald-400
        warning: "#fbbf24", // Amber-400
        destructive: "#ef4444", // Red-500

        // Borders / Dividers
        border: "#3d2856", // Violet border
        "border-light": "#4c3370", // Lighter violet border

        // Legacy compat
        muted: "#8b6b80",
        "muted-foreground": "#d4a0b9",
        card: "#1a1128",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
