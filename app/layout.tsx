import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOOP Shenzhen — Local experiences, thoughtfully hosted",
  description: "Book small-group, English-friendly experiences with trusted Shenzhen locals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
