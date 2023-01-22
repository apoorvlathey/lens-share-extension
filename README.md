# 🌿 Lens Share Extension

## Installation

1. Clone this repository
2. Create `.env` file and fill out variables from `.env.sample`
3. Install packages: `yarn install`
4. Build extension: `yarn build`
5. Now go to browser extension settings, turn on developer mode and then click "Load unpacked". Select the `build` folder generated in previous step.
6. Now click on a twitter post to land on url like: `https://twitter.com/username/status/12345` and you'd see "Share on Lens" button below the tweet (reload page if button not visible).

## Working:

1. The content script `inject.ts` injects `lens-share-react-app` into the Twitter webpage.
2. `lens-share-react-app` is added to the DOM. Easier to handle state, use chakra-ui and other web3 npm packages via React.
3. The "Share on Lens" button is injected into Twitter's code via React Portals.
