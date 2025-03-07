/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/app/**/*.{js,ts,jsx,tsx}"], // ✅ Ensures Tailwind scans `layout.tsx`
    theme: {
      extend: {},
    },
    plugins: [],
  };
  