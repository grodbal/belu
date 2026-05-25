import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./cliente-panel-original.css";
import "./beluer-panel-original.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "belu",
  description: "Belleza premium a domicilio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}