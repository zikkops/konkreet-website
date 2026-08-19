import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  // 400 body, 700 headings/labels, 900 hero display — matching the weights
  // the source actually renders (its <strong> tags step each weight up).
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Konkreet",
  description:
    "Konkreet is built around disciplined execution, technical site coordination, and engineering-led delivery across residential, commercial, hospitality, and renovation projects.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${raleway.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
