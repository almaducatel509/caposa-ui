import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./_providers/providers";
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "CAPOSA",
  description: "Plateforme de gestion coopérative CAPOSA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('caposa-theme') || 'system';
                  var isDark = saved === 'dark' || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-200">
        <NextTopLoader
          color="#2E7D32"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2E7D32,0 0 5px #2E7D32"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
