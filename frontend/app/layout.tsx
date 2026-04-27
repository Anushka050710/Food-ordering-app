'use client';
import './globals.css';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import AiChatbot from '@/components/AiChatbot';
import { getUser } from '@/lib/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = typeof window !== 'undefined' ? getUser() : null;
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <ApolloProvider client={apolloClient}>
          {children}
          {user && <AiChatbot />}
        </ApolloProvider>
      </body>
    </html>
  );
}
