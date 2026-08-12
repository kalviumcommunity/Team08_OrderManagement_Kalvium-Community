/**
 * Tailwind CSS Configuration
 * Scans JavaScript and JSX files in the `src` directory for utility classes
 * and extends theme with custom CSS variable color definitions.
 * 
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
