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
  };
} = {
  [polygon.id]: {
    lensHubProxy: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
    apiURL: "https://api.lens.dev",
  },
  [polygonMumbai.id]: {
    lensHubProxy: "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82",
    apiURL: "https://api-mumbai.lens.dev",
  },
};

export const config = chainIdToConfig[targetChain.id];
