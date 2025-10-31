import localFont from "next/font/local";
export const dmSans = localFont({
  src: [
    {
// "/home/shaurya/Desktop/New_____Folder/Aynigma/red-team/garak-frontend/src/style/fonts/DMSans-Bold.ttf"
      path: "../fonts/DMSans-Bold.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/DMSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/DMSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/DMSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../fonts/DMSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/DMSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});
