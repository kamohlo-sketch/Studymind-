import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata = {
  title: 'StudyMind',
  description: 'Your AI-powered study companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
