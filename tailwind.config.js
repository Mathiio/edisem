/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('./src/theme/tailwind.preset')],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [require("tailwind-scrollbar")]
};


// module.exports = {
//   content: [
//     './pages/**/*.{js,ts,jsx,tsx,mdx}',
//     './src/**/*.{js,ts,jsx,tsx,mdx}',
//     './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
//   ],
//   presets: [require('./src/theme/tailwind.preset')],
//   theme: {
//     extend: {},
//   },
//   darkMode: 'class',
//   plugins: [
//     function ({ addUtilities }) {
//       const newUtilities = {
//         ".scrollbar-thin": {
//           scrollbarWidth: "thin",
//           scrollbarColor: "rgb(31 29 29) white"
//         },
//         ".scrollbar-webkit": {
//           "&::-webkit-scrollbar": {
//             width: "2vw"
//           },
//           "&::-webkit-scrollbar-track": {
//             background: "white"
//           },
//           "&::-webkit-scrollbar-track": {
//             backgroundColor: "rgb(31 41 55)",
//             borderRadius: "20px",
//             border: "1px solid white",
//           },
//           "::-webkit-scrollbar-button:vertical:start:increment, ::-webkit-scrollbar-button:vertical:end:decrement, ::-webkit-scrollbar-button:horizontal:end:increment, ::-webkit-scrollbar-button:horizontal:end:decrement": {
//             display: "none"
//           }
//         }
//       }
//       addUtilities(newUtilities, ["responsive", "hover"])
//     }
//   ],
// };
