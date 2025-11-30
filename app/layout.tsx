import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Palette | AI Product Photography",
  description: "Generate professional product photography in seconds with Palette.",
  icons: {
    icon: [
      { url: '/mark.png', type: 'image/png' },
    ],
    shortcut: '/mark.png',
    apple: '/mark.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        {children}
        <Toaster 
          position="top-center"
          offset="56px"
          toastOptions={{
            className: 'mt-2',
          }}
        />
      </body>
    </html>
  );
}
