import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/sections/Nav";
import { XWipeProvider } from "@/components/ui/XWipe";
import { SectionJumpProvider } from "@/components/ui/SectionJump";
import { site } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "CodeXLab · Coding Club, Silver Oak University", template: "%s · CodeXLab" },
  description: site.description,
  openGraph: {
    title: "CodeXLab",
    description: site.tagline.join(" "),
    images: ["/brand/codexlab-logo.jpeg"],
  },
};

export const viewport: Viewport = { themeColor: "#f8f4ee" };

// Runs before paint: marks JS as available, and skips the intro if already seen or motion is reduced.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('cx-intro-seen')||matchMedia('(prefers-reduced-motion: reduce)').matches||location.pathname!=='/'||location.hash)d.classList.add('skip-intro')}catch(e){d.classList.add('skip-intro')}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
        >
          Skip to content
        </a>
        <XWipeProvider>
          <SectionJumpProvider>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
          </SectionJumpProvider>
        </XWipeProvider>
      </body>
    </html>
  );
}
