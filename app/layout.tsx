import type { Metadata } from 'next';
import './globals.css';
import './result-overrides.css';

export const metadata: Metadata = {
  title: 'Odómetro Humano',
  description: 'Una lectura lúdica de tus kilómetros humanos.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
