const sharedWebPreset = require("@repo/tailwind-config/web");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedWebPreset],
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
};
