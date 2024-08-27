import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

// Add this import
import { DefaultSession } from 'next-auth';

// Extend the Session type
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: {
      id?: string;
    } & DefaultSession['user']
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);