import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  from,
  gql,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import jwtDecode from "jwt-decode";
import axios from "axios";
import { config } from "./react-app/config";

const REFRESH_AUTHENTICATION = `
  mutation($request: RefreshRequest!) { 
    refresh(request: $request) {
      accessToken
      refreshToken
    }
 }
`;

const httpLink = new HttpLink({
  uri: config.apiURL,
  fetch,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  // console.log("jwt token:", accessToken);

  if (!accessToken) {
    return forward(operation);
  }

  operation.setContext({
    headers: {
      "x-access-token": accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  const { exp }: { exp: number } = jwtDecode(accessToken);

  if (Date.now() >= exp * 1000) {
    axios({
      url: config.apiURL,
      method: "post",
      data: {
        query: REFRESH_AUTHENTICATION,
        variables: {
          request: {
            refreshToken,
          },
        },
      },
    })
      .then(({ data }) => {
        const tokens = data.data.refresh;
        const _accessToken = tokens.accessToken;
        // Use the setContext method to set the HTTP headers.
        operation.setContext({
          headers: {
            "x-access-token": _accessToken ? `Bearer ${_accessToken}` : "",
          },
        });

        localStorage.setItem("accessToken", _accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      });
  }

  // Call the next link in the middleware chain.
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
