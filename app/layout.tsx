// app/layout.tsx (Server Component)
import Providers from '../components/Providers'; // 👈 ONLY import this
import ClientShell from '../components/ClientShell';
import { Toaster } from 'react-hot-toast';
import { Sidenav } from '../components/Sidenav'; // 👈 Import the Sidenav
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div style={{ display: 'flex' }}>
          <Providers>
            <Sidenav /> {/* 👈 Add the Sidenav */}
            <ClientShell />
            <Toaster position="top-right" />
            {/* Content area is shifted to the right */}
            <main style={{ marginLeft: '220px', padding: '20px', flexGrow: 1 }}>
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  );
}
