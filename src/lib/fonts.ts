import localFont from "next/font/local";

export const dmSans = localFont({
  src: [
    {
      path: "../components/fonts/DMSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../components/fonts/DMSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../components/fonts/DMSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../components/fonts/DMSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../components/fonts/DMSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../components/fonts/DMSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});
