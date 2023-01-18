import { apolloClient } from "./apollo-client";
import { gql } from "@apollo/client";

const init = async () => {
  // inject lens-share-react-app.js into webpage
  try {
    let script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    const lensShareExtensionUrl = chrome.runtime.getURL(`/`).slice(0, -1); // slice the trailing `/`
    script.src = `${lensShareExtensionUrl}/static/js/lens-share-react-app.js`;
    script.onload = async function () {
      // @ts-ignore
      this.remove();

      // send url to injected react app
      window.postMessage(
        {
          type: "lensShareExtensionUrl",
          msg: {
            lensShareExtensionUrl,
          },
        },
        "*"
      );
    };
    document.head
      ? document.head.prepend(script)
      : document.documentElement.prepend(script);
  } catch (e) {
    console.log(e);
  }
};

init();

// --- GraphQl / Axios fetchers ---

const GET_DEFAULT_PROFILES = `
  query($request: DefaultProfileRequest!) {
    defaultProfile(request: $request) {
      id
      handle
      picture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          chainId
          verified
        }
        ... on MediaSet {
          original {
            url
            mimeType
          }
        }
      }
    }
  }
`;
const GET_PROFILES = `
  query($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        id
        handle
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
        }
      }
    }
  }
`;
const GET_CHALLENGE = `
  query($request: ChallengeRequest!) {
    challenge(request: $request) { text }
  }
`;
const AUTHENTICATION = `
  mutation($request: SignedAuthChallenge!) { 
    authenticate(request: $request) {
      accessToken
      refreshToken
    }
 }
`;
const CREATE_POST_TYPED_DATA = `
  mutation($request: CreatePublicPostRequest!) { 
    createPostTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
            name
            type
          }
        }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        contentURI
        collectModule
        collectModuleInitData
        referenceModule
        referenceModuleInitData
      }
    }
  }
}
`;

const sendRes = (type: string, res: any) => {
  window.postMessage(
    {
      type: `res_${type}`,
      msg: {
        res,
      },
    },
    "*"
  );
};

// Receive messages from injected react-app
window.addEventListener("message", async (e) => {
  // only accept messages from us
  if (e.source !== window) {
    return;
  }

  if (!e.data.type) {
    return;
  }

  switch (e.data.type) {
    case "GET_DEFAULT_PROFILES": {
      const ethereumAddress = e.data.msg.ethereumAddress as string;
      const res = await apolloClient.query({
        query: gql(GET_DEFAULT_PROFILES),
        variables: {
          request: {
            ethereumAddress,
          },
        },
      });
      // send res back to react-app
      sendRes(e.data.type, res);
      break;
    }
    case "GET_PROFILES": {
      const ethereumAddress = e.data.msg.ethereumAddress as string;
      const res = await apolloClient.query({
        query: gql(GET_PROFILES),
        variables: {
          request: { ownedBy: [ethereumAddress], limit: 1 },
        },
      });
      // send res back to react-app
      sendRes(e.data.type, res);
      break;
    }
    case "GET_CHALLENGE": {
      const address = e.data.msg.address as string;
      const res = await apolloClient.query({
        query: gql(GET_CHALLENGE),
        variables: {
          request: {
            address,
          },
        },
      });
      // send res back to react-app
      sendRes(e.data.type, res);
      break;
    }
    case "AUTHENTICATION": {
      const address = e.data.msg.address as string;
      const signature = e.data.msg.signature as string;
      const res = await apolloClient.mutate({
        mutation: gql(AUTHENTICATION),
        variables: {
          request: {
            address,
            signature,
          },
        },
      });
      // send res back to react-app
      sendRes(e.data.type, res);
      break;
    }
    case "CREATE_POST_TYPED_DATA": {
      const createPostTypedDataRequest = e.data.msg
        .createPostTypedDataRequest as any;
      const res = await apolloClient.mutate({
        mutation: gql(CREATE_POST_TYPED_DATA),
        variables: {
          request: createPostTypedDataRequest,
        },
      });
      // send res back to react-app
      sendRes(e.data.type, res);
      break;
    }
  }
});

// to remove isolated modules error
export {};
