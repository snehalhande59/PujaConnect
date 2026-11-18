import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevSutra – Your Sacred Journey, Simplified | Online Puja & Pandit Booking',
  description: 'Book verified Pandits, discover sacred rituals, and shop authentic Puja Samagri with DevSutra — bringing traditional Sanatan spirituality closer to your home.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-ivory text-brown selection:bg-beige selection:text-maroon">
        {children}
      </body>
    </html>
  );
}
