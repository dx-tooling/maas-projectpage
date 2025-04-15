/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: ["./src/**/*.html", "./src/**/*.ts"],
    theme: {
        extend: {},
    },
    plugins: [require("@tailwindcss/forms")],
};
