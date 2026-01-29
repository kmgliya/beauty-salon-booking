import "./globals.css";
import Link from "next/link";
import { Providers } from "./providers";

export const metadata = {
  title: "SlotSync — салон красоты",
  description: "Онлайн-бронирование услуг салона красоты",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <div className="site">
            <header className="topbar">
              <div className="brand">
                <span className="brand-mark">Bloom & Glow</span>
                <span className="brand-sub">Beauty Studio</span>
              </div>
              <nav className="nav">
                <Link href="/">Home</Link>
                <Link href="/services">Services</Link>
                <Link href="/specialists">Specialists</Link>
                <Link href="/booking">Booking</Link>
                <Link href="/profile">Profile</Link>
              </nav>
              <Link className="cta" href="/booking">
                Online Booking
              </Link>
            </header>
            <main className="content">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
