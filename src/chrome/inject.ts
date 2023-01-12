const injectScript = (name: string) => {
  try {
    let script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.src = chrome.runtime.getURL(`/static/js/${name}`);
    script.onload = async function () {
      // @ts-ignore
      this.remove();
    };
    document.head
      ? document.head.prepend(script)
      : document.documentElement.prepend(script);
  } catch (e) {
    console.log(e);
  }
};

const init = async () => {
  // inject lens-share.js & lens-share-react-app.js into webpage
  injectScript("lens-share.js");
  injectScript("lens-share-react-app.js");
};

init();

// to remove isolated modules error
export {};
