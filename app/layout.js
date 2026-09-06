import './globals.css';

export const metadata = {
  title: 'ASTRUM | The ADAM Institute at Elton',
  description: 'Private learning and mission-assurance portal for The Astrum Program.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
