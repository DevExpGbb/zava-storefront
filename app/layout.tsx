import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Zava — Crafted goods for everyday rituals",
  description:
    "Zava is a curated storefront for thoughtfully designed home goods, apparel, and accessories.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container site-header__inner">
            <a href="/" className="brand" aria-label="Zava home">
              <span className="brand__mark" aria-hidden="true">Z</span>
              <span>Zava</span>
            </a>
            <nav className="nav" aria-label="Primary">
              <a href="/">Shop</a>
              <a href="/">New arrivals</a>
              <a href="/">Collections</a>
              <a href="/">Journal</a>
              <a href="/">About</a>
            </nav>
            <div className="header-actions">
              <button className="icon-btn" type="button" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
              <button className="icon-btn" type="button" aria-label="Account">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </button>
              <button className="icon-btn" type="button" aria-label="Cart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.7H8.5a2 2 0 0 1-2-1.7L5 7Z" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {children}

        <footer className="site-footer">
          <div className="container">
            <div className="site-footer__inner">
              <div>
                <a href="/" className="brand" aria-label="Zava home">
                  <span className="brand__mark" aria-hidden="true">Z</span>
                  <span>Zava</span>
                </a>
                <p className="site-footer__tagline">
                  Thoughtfully designed goods for the rituals that make a house
                  a home.
                </p>
              </div>
              <div>
                <h4>Shop</h4>
                <ul>
                  <li><a href="/">New arrivals</a></li>
                  <li><a href="/">Best sellers</a></li>
                  <li><a href="/">Collections</a></li>
                  <li><a href="/">Gift cards</a></li>
                </ul>
              </div>
              <div>
                <h4>Company</h4>
                <ul>
                  <li><a href="/">About</a></li>
                  <li><a href="/">Journal</a></li>
                  <li><a href="/">Sustainability</a></li>
                  <li><a href="/">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4>Help</h4>
                <ul>
                  <li><a href="/">Shipping &amp; returns</a></li>
                  <li><a href="/">Contact</a></li>
                  <li><a href="/">FAQ</a></li>
                </ul>
              </div>
            </div>
            <div className="site-footer__bottom">
              <span>© {new Date().getFullYear()} Zava. All rights reserved.</span>
              <span>
                <a href="/">Privacy</a> · <a href="/">Terms</a>
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
