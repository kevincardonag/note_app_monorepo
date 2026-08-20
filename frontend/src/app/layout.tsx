import type { Metadata } from 'next';
import { Inter, Inria_Serif } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const inriaSerif = Inria_Serif({
  weight: ['400', '700'],
  variable: '--font-inria-serif',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Note App — Organize Your Thoughts',
  description: 'A clean and modern note-taking application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${inriaSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#FAF1E3] font-sans text-[#4A3B32]">
        {children}
      </body>
    </html>
  );
}
