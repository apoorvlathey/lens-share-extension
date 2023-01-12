# Lens Share Extension

## Working:

1. The content script `inject.ts` injects `lens-share.ts` & `lens-share-react-app` into the Twitter webpage
2. `lens-share.ts` creates a "Share on Lens" button
3. `lens-share-react-app` is added to the DOM. Easier to handle state, use chakra-ui and other web3 npm packages
4. The "Share on Lens" button communicates with the react-app via events
