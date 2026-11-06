import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "@/styles/globals.css";

const siteUrl = process.env.AUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sewlesew Biazen — Engineering Studio",
    template: "%s — Sewlesew Biazen",
  },
  description: "Personal engineering studio — software, systems, and notes from the engineering desk.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Sewlesew Biazen — Engineering Studio",
    description: "Personal engineering studio — software, systems, and notes from the engineering desk.",
    type: "website",
    url: "/",
    siteName: "Sewlesew Biazen",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#151619" },
  ],
};

// Applies the saved theme before first paint to avoid a light-mode flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
