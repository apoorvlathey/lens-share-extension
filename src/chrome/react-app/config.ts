import { polygon, polygonMumbai } from "@wagmi/core/chains";

export const supportedChains = [polygon, polygonMumbai];

export const chainIdToRPC = {
  [polygon.id]: "https://polygon-rpc.com",
  [polygonMumbai.id]: "https://rpc-mumbai.maticvigil.com",
};
