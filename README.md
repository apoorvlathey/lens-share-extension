# 🌿 Lens Share Extension

## Installation

1. Visit the <a href="https://github.com/apoorvlathey/lens-share-extension/releases/latest">latest release</a> page and download <code>lens-share-extension-x.x.x.zip</code> file under Assets.
2. Extract the folder.
3. Go to Extensions settings in your browser. For brave it's at: `brave://extensions/`
4. Toggle on the "Developer mode"
5. Click "Load unpacked" and select the folder extracted above.
6. Lens Share is now installed!

## Usage

1. Go to twitter.com and click on any tweet
2. You'd see a "Share on Lens" button beneath the tweet.
3. Click on it.
4. Connect your wallet & press the "Post" button.
5. Confirm the transaction in your wallet.
6. That's it! Your tweet will be migrated over to the Lens Protocol 🌿
7. Lens Share handles uploading images & text to IPFS automatically in the background & offers a seamless experience to you.

---

## Setting up the Project

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
