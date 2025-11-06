import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './components/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lecture Reminder System',
  description: 'A system to manage lecture schedules and send reminders',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}