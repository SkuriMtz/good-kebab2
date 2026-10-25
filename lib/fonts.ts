import localFont from "next/font/local";

/** Inter variable, auto-alojada (sustituto que piden los archivos de estilo). */
export const inter = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});
