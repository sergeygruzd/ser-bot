import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sergey Gruzd",
  description: "Personal site - talk to my clone, see my work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="site">
          <Link href="/" className="home">Sergey Gruzd</Link>
          <Link href="/about">About</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/writing">Writing</Link>
          <Link href="/cv">CV</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
