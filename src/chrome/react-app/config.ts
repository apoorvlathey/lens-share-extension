import { polygon, polygonMumbai } from "@wagmi/core/chains";

export const targetChain =
  process.env.REACT_APP_USE_TESTNET === "true" ? polygonMumbai : polygon;

export const supportedChains = [targetChain];

export const chainIdToRPC = {
  [polygon.id]: "https://polygon-rpc.com",
  [polygonMumbai.id]: "https://rpc-mumbai.maticvigil.com",
};

export const chainIdToConfig: {
  [chainId: number]: {
    lensHubProxy: `0x${string}`;
    apiURL: string;
    currencies: {
      name: string;
      address: string;
    }[];
  };
} = {
  [polygon.id]: {
    lensHubProxy: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
    apiURL: "https://api.lens.dev",
    // source: https://github.com/lens-protocol/token-list/blob/main/mainnet-token-list.json
    currencies: [
      {
        name: "Wrapped Matic",
        address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      },
      {
        name: "Wrapped Ether",
        address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      },
      {
        name: "USDC (PoS)",
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      },
      {
        name: "DAI (PoS)",
        address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      },
      {
        name: "Nature Carbon Tonne",
        address: "0xD838290e877E0188a4A44700463419ED96c16107",
      },
    ],
  },
  [polygonMumbai.id]: {
    lensHubProxy: "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82",
    apiURL: "https://api-mumbai.lens.dev",
    // source: https://github.com/lens-protocol/token-list/blob/main/testnet-token-list.json
    currencies: [
      {
        name: "Wrapped Matic",
        address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
      },
      {
        name: "Wrapped Ether",
        address: "0x3C68CE8504087f89c640D02d133646d98e64ddd9",
      },
      {
        name: "USDC",
        address: "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
      },
      {
        name: "DAI",
        address: "0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F",
      },
      {
        name: "Nature Carbon Tonne",
        address: "0x7beCBA11618Ca63Ead5605DE235f6dD3b25c530E",
      },
    ],
  },
};

export const config = chainIdToConfig[targetChain.id];
