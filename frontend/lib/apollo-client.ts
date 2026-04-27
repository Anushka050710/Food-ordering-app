import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const httpLink = createHttpLink({ uri: `${BACKEND_URL}/graphql` });

const authLink = setContext((_, { headers }) => {
  const token = Cookies.get('token');
  return {
    headers: { ...headers, authorization: token ? `Bearer ${token}` : '' },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
