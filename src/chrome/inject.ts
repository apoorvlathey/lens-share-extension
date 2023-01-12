const injectScript = (name: string) => {};

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

// to remove isolated modules error
export {};
