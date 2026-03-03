import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'HydrogenX Dashboard',
  description: 'Green hydrogen modeling platform'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-gray-200">
        {children}
      </body>
    </html>
  );
}
