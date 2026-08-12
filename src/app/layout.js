import localFont from "next/font/local";
import "./globals.css";

/**
 * Custom Local Font Configuration
 * Configures Geist Sans and Geist Mono variable fonts for modern typography across the app.
 */
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

/**
 * Root Metadata for Next.js SEO & Browser Tab
 */
export const metadata = {
  title: "Order & Inventory Management System",
  description: "Real-time restaurant order and inventory management system",
};

/**
 * Root Layout Component
 * Wraps all pages with HTML5 shell and custom font CSS variables.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
