'use client';

import React from 'react';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      // Dynamically resolve URL for SSR vs CSR
      uri: typeof window === 'undefined' 
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql` 
        : '/api/graphql',
    }),
    cache: new InMemoryCache(),
  });
};

export function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  // Always instantiate inside the component to prevent cross-request state pollution in SSR
  const client = createApolloClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
