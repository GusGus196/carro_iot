export default {
  theme: {
    extend: {
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dark", "light"],
    defaultTheme: "dark",
  },
}