/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: ["./src/**/*.{html,js,ts}", "./loaders/**/*.{js,ts}"],
    theme: {
        extend: {
            // Remove the backgroundImage extension
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
