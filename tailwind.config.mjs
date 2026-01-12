/** @type {import('tailwindcss').Config} */
const config = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx,md,mdx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./content/**/*.{md,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};

export default config;
