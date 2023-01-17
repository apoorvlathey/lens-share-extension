// @ts-ignore
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { InjectedConnector } from "wagmi/connectors/injected";
import { supportedChains, chainIdToRPC } from "./config";
import { LensProvider } from "./contexts/LensContext";
import theme from "./theme";
import App from "./App";

const { chains, provider } = configureChains(supportedChains, [
  jsonRpcProvider({
    rpc: (chain) => ({
      http: chainIdToRPC[chain.id]!,
    }),
  }),
]);

const client = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        shimChainChangedDisconnect: true,
        shimDisconnect: true,
      },
    }),
  ],
  provider,
});

// receive from content_script (inject.ts)
window.addEventListener("message", (e: any) => {
  // only accept messages from us
  if (e.source !== window) {
    return;
  }

  if (e.data.type === "lensShareExtensionUrl") {
    // set this value to window so it's accessible everywhere
    (window as any).lensShareExtensionUrl = e.data.msg.lensShareExtensionUrl;
  }
});

const body = document.querySelector("body");
const app = document.createElement("div");
app.id = "lens-share-react-app";

if (body) {
  body.prepend(app);
}

const root = createRoot(app);
root.render(
  <ChakraProvider theme={theme}>
    <WagmiConfig client={client}>
      <LensProvider>
        <App />
      </LensProvider>
    </WagmiConfig>
  </ChakraProvider>
); // Render react component
